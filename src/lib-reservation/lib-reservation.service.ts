import { Injectable, HttpService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
// import * as qs from 'qs';

@Injectable()
export class LibReservationService {
  constructor(private readonly httpService: HttpService) {}

  private sessionId = '';
  private room401 = {
    devId: '',
    labId: '',
  };

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
    } catch (e) {
      console.log('ERR_GET_SESSION_ID: ', e);
    }
  }

  async login() {
    const formData = new FormData();
    // userId: 101739408
    formData.append('id', '20183100958');
    formData.append('pwd', '094917');
    formData.append('act', 'login');
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
  }

  async getDeviceList() {
    const params = {
      dev_order: '',
      kind_order: '',
      classkind: 1,
      display: 'cld',
      md: 'd',
      kind_id: 100654218,
      purpose: '',
      selectOpenAty: '',
      cld_name: 'default',
      date: 20210922,
      act: 'get_rsv_sta',
      _: +new Date(),
    };
    const { data: res } = await this.httpService
      .request({
        method: 'GET',
        url: 'http://libzwyy.jlu.edu.cn/ClientWeb/pro/ajax/device.aspx',
        data: params,
      })
      .toPromise();
    this.room401 = res.data.find(i => i.roomName === '401');
  }

  async reserve() {
    const params = {
      dialogid: '',
      dev_id: this.room401.devId,
      lab_id: this.room401.labId,
      kind_id: 100654218,
      room_id: '',
      type: 'dev',
      prop: '',
      test_id: '',
      term: '',
      number: '',
      classkind: '',
      resv_kind: 1,
      test_name: 0,
      min_user: 5,
      max_user: 10,
      mb_list: '$101739408',
      start: '2021-09-23 17:30',
      end: '2021-09-23 20:20',
      start_time: 1730,
      end_time: 2020,
      up_file: '',
      memo: '',
      act: 'set_resv',
      _: +new Date(),
    };
    await this.httpService
      .request({
        method: 'GET',
        url: 'http://libzwyy.jlu.edu.cn/ClientWeb/pro/ajax/reserve.aspx',
        data: params,
      })
      .toPromise();
  }

  @Cron('*/10 * * * * *')
  async subscribe() {
    this.getSessionId();
  }
}
