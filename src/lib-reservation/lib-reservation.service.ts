import { Injectable, HttpService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as qs from 'qs';
import { shuffle } from 'lodash';

@Injectable()
export class LibReservationService {
  constructor(private readonly httpService: HttpService) {}

  private sessionId = '';
  private room401 = {
    devId: '',
    labId: '',
    kindId: '',
  };
  private memberList = [
    { pid: '20183100958', id: '101739408', pwd: '094917' },
    { pid: '20144100165', id: '100457358', pwd: '870906' },
    { pid: '20144100170', id: '100457402', pwd: '106025' },
    // { pid: '20193101556', id: '103535070', pwd: '304112' },
    // { pid: '20193101558', id: '103535068', pwd: '170034' },
    { pid: '20209BX0008', id: '105969933', pwd: '190323' },
    { pid: '20163100921', id: '100578981', pwd: '236427' },
    { pid: '20193101559', id: '103535067', pwd: '020854' },
  ];
  private timeList = [
    { from: '8:30', to: '12:30' },
    { from: '13:00', to: '17:00' },
    { from: '18:00', to: '21:30' },
  ];

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
      this.sessionId = cookie.split(';')[0];
      console.log(`[${new Date().format()}] SUCCESS_GET_SESSION_ID`);
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_GET_SESSION_ID: `, e);
    }
  }

  async login({ id, pwd }) {
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
            Cookie: this.sessionId,
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

  async reserve({ from, to }) {
    if (!from || !to) return;
    const sessionId = this.sessionId;
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
      console.log(`[${new Date().format()}] RESERVE_START: `, 'FROM: ', from, 'TO: ', to);
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
        return;
      }
      if (!res.data) {
        throw new Error(res.msg);
      }
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_RESERVE: `, e.message);
    }
  }

  // 秒 分 时 日 月 星期
  // 每日0点0分0秒
  @Cron('0 0 0 * * *')
  // @Cron('*/10 * * * * *')
  async subscribe() {
    try {
      await this.getDeviceList();
      const shuffledList = shuffle(this.memberList);
      for (let i = 0; i < this.timeList.length; i++) {
        const curUser = shuffledList[i];
        const curTime = this.timeList[i];
        await this.getSessionId();
        await this.login({ id: curUser.pid, pwd: curUser.pwd });
        this.reserve({ from: curTime.from, to: curTime.to });
      }
    } catch (e) {
      console.log(`[${new Date().format()}] ERR_SUBSCRIBE: `, e);
    }
  }
}