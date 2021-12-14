import { Injectable, HttpService } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LibReservation, LibReservationDocument } from './schemas/lib-reservation.schema';
import * as qs from 'qs';
import { shuffle } from 'lodash';
import { CronTime } from 'cron';

@Injectable()
export class LibReservationService {
  constructor(
    @InjectModel('LibReservation') private libModel: Model<LibReservationDocument>,
    private readonly httpService: HttpService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}
  private roomToReserve = {
    devId: '',
    labId: '',
    kindId: '',
  };
  private targetRoomName = '401';
  private memberList = [];
  private shuffledList = [];
  private timeList = [
    { from: '8:30', to: '12:30' },
    { from: '13:00', to: '17:00' },
    { from: '17:30', to: '21:30' },
  ];

  async getTimeLag() {
    try {
      const { headers } = await this.httpService
        .request({
          method: 'GET',
          url: 'http://libzwyy.jlu.edu.cn/ClientWeb/xcus/ic2/Default.aspx',
        })
        .toPromise();
      const targetServerTimeLag = Math.max(+new Date() - +new Date(headers['date']), 0);
      const timeLag = new Date(targetServerTimeLag);
      // 目标服务器时间次日0点0分0秒
      const reserveCron = `${timeLag.getSeconds() + 0} ${timeLag.getMinutes() + 0} 0 * * *`;
      // const time = new Date(Date.now() + 10 * 1000);
      const subscribeJob = this.schedulerRegistry.getCronJob('subscribe');
      subscribeJob.setTime(new CronTime(reserveCron));
      // 需要手动start
      subscribeJob.start();
      console.log(`[${new Date().format()}] CRONJOB_STARTED, NEXT TIME IS: `, subscribeJob.nextDate());
      // const newJob = new CronJob(time, () => {
      //   this.subscribe();
      // });
      // this.schedulerRegistry.addCronJob('subscribe', newJob);
      // newJob.start();
      console.log(`[${new Date().format()}] TIME_LAG: ${timeLag.getMinutes()}:${timeLag.getSeconds()}`);
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_TIME_LAG: ${e.message}`);
    }
  }

  async findMemberList(): Promise<LibReservation[]> {
    return this.libModel
      .find(
        {},
        {
          pid: 1,
          id: 1,
          pwd: 1,
          name: 1,
        },
      )
      .sort({ pid: -1 })
      .lean();
  }

  async getSessionId() {
    try {
      const { headers } = await this.httpService
        .request({
          method: 'GET',
          url: 'http://libzwyy.jlu.edu.cn/ClientWeb/xcus/ic2/Default.aspx',
        })
        .toPromise();
      // 'set-cookie': [ 'ASP.NET_SessionId=emdcqo55t1jlu1jgwxxzkk45; path=/; HttpOnly' ]
      const cookie = headers['set-cookie'][0];
      console.log(`[${new Date().format()}] SUCCESS_GET_SESSION_ID`);
      return cookie.split(';')[0];
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_GET_SESSION_ID: `, e);
    }
  }

  async login({ id, pwd, sessionId }) {
    const formData = qs.stringify({
      id,
      pwd,
      act: 'login',
    });
    try {
      await this.httpService
        .request({
          method: 'POST',
          url: 'http://libzwyy.jlu.edu.cn/ClientWeb/pro/ajax/login.aspx',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            Cookie: sessionId,
          },
          data: formData,
        })
        .toPromise();
      console.log(`[${new Date().format()}] SUCCESS_LOGIN: `, id, sessionId);
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_LOGIN: `, e);
    }
  }

  async getDeviceList() {
    const today = new Date();
    // 前一天23点执行, 预约第三天
    const nextDate = new Date(today.setDate(today.getDate() + 2));
    const formattedDate = nextDate.format('yyyyMMdd');
    const params = {
      dev_order: '',
      kind_order: '',
      classkind: '1',
      display: 'cld',
      md: 'd',
      // 5-10人团体间
      kind_id: '100654218',
      purpose: '',
      selectOpenAty: '',
      cld_name: 'default',
      date: formattedDate,
      act: 'get_rsv_sta',
    };
    try {
      const { data: res } = await this.httpService
        .request({
          method: 'GET',
          url: 'http://libzwyy.jlu.edu.cn/ClientWeb/pro/ajax/device.aspx',
          params: params,
        })
        .toPromise();
      this.roomToReserve = res.data.find(i => i.roomName === this.targetRoomName);
      console.log(`[${new Date().format()}] SUCCESS_GET_ROOMS`);
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_GET_DEVICE_LIST: `, e);
    }
  }

  async reserve({ from, to, sessionId }) {
    if (!from || !to) return;
    const memberIdList = this.memberList.map(member => member.id);
    const mb_list = '$' + memberIdList.join(',');
    const today = new Date();
    const nextDate = new Date(today.setDate(today.getDate() + 1));
    const formattedDate = nextDate.format('yyyy-MM-dd');
    const params = {
      dialogid: '',
      dev_id: this.roomToReserve.devId,
      lab_id: this.roomToReserve.labId,
      kind_id: this.roomToReserve.kindId,
      room_id: '',
      type: 'dev',
      prop: '',
      test_id: '',
      term: '',
      number: '',
      classkind: '',
      resv_kind: '1',
      test_name: '0',
      min_user: '5',
      max_user: '10',
      mb_list,
      start: `${formattedDate} ${from}`,
      end: `${formattedDate} ${to}`,
      start_time: from.replace(':', ''),
      end_time: to.replace(':', ''),
      up_file: '',
      memo: '',
      act: 'set_resv',
      _: `${+new Date()}`,
    };
    try {
      console.log(`[${new Date().format()}] RESERVE_START: `, 'FROM: ', from, 'TO: ', to, 'SESSION_ID: ', sessionId);
      const { data: res } = await this.httpService
        .request({
          method: 'GET',
          headers: { Cookie: sessionId },
          url: 'http://libzwyy.jlu.edu.cn/ClientWeb/pro/ajax/reserve.aspx',
          params: params,
        })
        .toPromise();
      if (/操作成功/.test(res.msg)) {
        console.log(`[${new Date().format()}] SUCCESS_RESERVE: `, 'res: ', res);
        return `${from} - ${to}`;
      }
      if (!res.data) {
        throw new Error(res.msg);
      }
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_RESERVE: `, e.message);
      throw `${from} - ${to}`;
    }
  }

  sendCompanyWxMsg({ date, successTime, failedTime }) {
    this.httpService
      .request({
        method: 'POST',
        url: 'http://localhost:7001/api/companywx',
        data: {
          date,
          successTime,
          failedTime,
        },
      })
      .toPromise();
  }

  // 秒 分 时 日 月 星期
  // 每日23点59分0秒
  @Cron('0 59 23 * * *')
  // 启动0秒后执行
  // @Cron(new Date(Date.now() + 5 * 1000))
  // @Cron('*/20 * * * * *')
  async groupLogin() {
    this.getTimeLag();
    try {
      this.memberList = await this.findMemberList();
      this.shuffledList = shuffle(this.memberList)
        .slice(0, 3)
        .map((member, index) => ({
          id: member.pid,
          pwd: member.pwd,
          from: this.timeList[index].from,
          to: this.timeList[index].to,
          sessionId: '',
        }));
      for (let i = 0; i < this.timeList.length; i++) {
        const curUser = this.shuffledList[i];
        curUser.sessionId = await this.getSessionId();
        await this.login(curUser);
      }
      await this.getDeviceList();
    } catch (e) {
      console.log('ERR_GROUP_LOGIN: ', e.message);
    }
  }

  @Cron('0 0 0 * * *', { name: 'subscribe' })
  async subscribe() {
    console.log(`[${new Date().format()}] SUBSCRIBE_START`);
    try {
      const shuffledList = this.shuffledList;
      Promise.allSettled([
        this.reserve(shuffledList[0]),
        this.reserve(shuffledList[1]),
        this.reserve(shuffledList[2]),
      ]).then(resArr => {
        const today = new Date();
        const nextDate = new Date(today.setDate(today.getDate() + 1));
        const formattedDate = nextDate.format('yyyy-MM-dd');
        const successTime = (resArr.filter(res => res.status === 'fulfilled') as PromiseFulfilledResult<unknown>[]).map(
          res => res.value,
        );
        const failedTime = (resArr.filter(res => res.status === 'rejected') as PromiseRejectedResult[]).map(
          res => res.reason,
        );
        if (failedTime.length) {
          this.sendCompanyWxMsg({
            date: formattedDate,
            successTime,
            failedTime,
          });
        }
      });
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_SUBSCRIBE: `, e);
    }
  }
}
