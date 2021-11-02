import { Injectable, HttpService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LibReservation, LibReservationDocument } from './schemas/lib-reservation.schema';
import * as qs from 'qs';
import { shuffle } from 'lodash';

@Injectable()
export class LibReservationService {
  constructor(
    @InjectModel('LibReservation') private libModel: Model<LibReservationDocument>,
    private readonly httpService: HttpService,
  ) {}
  private room401 = {
    devId: '',
    labId: '',
    kindId: '',
  };
  private memberList = [];
  private timeList = [
    { from: '8:30', to: '12:30' },
    { from: '13:00', to: '17:00' },
    { from: '17:30', to: '21:30' },
  ];

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
      console.log(`[${new Date().format()}] SUCCESS_LOGIN: `, id);
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_LOGIN: `, e);
    }
  }

  async getDeviceList() {
    const today = new Date();
    const nextDate = new Date(today.setDate(today.getDate() + 1));
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
      this.room401 = res.data.find(i => i.roomName === '401');
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
      dev_id: this.room401.devId,
      lab_id: this.room401.labId,
      kind_id: this.room401.kindId,
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
      if (res.msg === '操作成功！') {
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
  // 每日0点0分0秒
  @Cron('0 0 0 * * *')
  // @Cron('0 34 9 * * *')
  async subscribe() {
    try {
      this.memberList = await this.findMemberList();
      await this.getDeviceList();
      const shuffledList = shuffle(this.memberList)
        .slice(0, 3)
        .map((member, index) => ({
          id: member.pid,
          pwd: member.pwd,
          from: this.timeList[index].from,
          to: this.timeList[index].to,
          sessionId: '',
        }));
      for (let i = 0; i < this.timeList.length; i++) {
        const curUser = shuffledList[i];
        curUser.sessionId = await this.getSessionId();
        await this.login(curUser);
      }
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
