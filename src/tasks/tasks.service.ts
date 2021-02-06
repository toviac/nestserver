import { Injectable, HttpService } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WowTokenService } from '../wow-token/wow-token.service';
import * as qs from 'qs';

@Injectable()
export class TasksService {
  constructor(private readonly wowTokenService: WowTokenService, private readonly httpService: HttpService) {}
  private accessToken = '';

  async getAccessToken() {
    try {
      // 'curl -u 900143fcccbd4eceab3c91fc70a71807:mfAPIY5e3n7UhFUnvKCoi1h3tjmbHHd9 -d grant_type=client_credentials https://www.battlenet.com.cn/oauth/token'
      const { data: tokenRes } = await this.httpService
        .request({
          method: 'POST',
          url: 'https://www.battlenet.com.cn/oauth/token',
          // 需要发送的请求数据，由qs.stringify()转换为formData。
          data: qs.stringify({ grant_type: 'client_credentials' }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          // 简单登录授权（Basic Authentication）参数，将以明文方式将登录信息以 Authorization 请求头发送出去。
          auth: { username: '900143fcccbd4eceab3c91fc70a71807', password: 'mfAPIY5e3n7UhFUnvKCoi1h3tjmbHHd9' },
        })
        .toPromise();
      this.accessToken = tokenRes.access_token;
      console.log('ACCESS_TOKEN: ', this.accessToken);
    } catch (e) {
      console.log('ERR_GET_ACCESS_TOKEN: ', e);
    }
  }

  async getWowTokenData() {
    try {
      // 'curl -H "Authorization: Bearer CNPdGgGnESWkw09Li8CBZuVPl0IYp7TST7" https://gateway.battlenet.com.cn/data/wow/token/index?namespace=dynamic-classic-cn&local=zh-CN'
      const res = await this.httpService
        .get('https://gateway.battlenet.com.cn/data/wow/token/index?namespace=dynamic-classic-cn&local=zh-CN', {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })
        .toPromise();
      return new Promise((resolve, reject) => {
        if (res.status === 200) {
          resolve({ data: res.data });
        } else {
          const err = { status: res.status, data: res.data };
          console.log(new Date(), 'ERR_GET_TOKEN_DATA: ', err);
          reject(err);
        }
      });
    } catch (e) {
      console.log('ERR_GET_TOKEN_DATA: ', e);
    }
  }

  // subscribe 是真正定时任务执行时被运行的函数
  @Cron('0 */20 * * * *')
  async subscribe() {
    if (!this.accessToken) {
      await this.getAccessToken();
    }
    let res = null;
    try {
      res = await this.getWowTokenData();
    } catch (e) {
      if (e.status === 401) {
        // 未授权(accessToken过期)
        await this.getAccessToken();
      }
      res = await this.getWowTokenData();
    }
    const { last_updated_timestamp: updateTime, price } = res.data;
    console.log(new Date(), 'token: ', { updateTime: new Date(updateTime), price });
    try {
      await this.wowTokenService.create({
        updateTime,
        price,
      });
    } catch (e) {
      console.log('ERR_CREATE_DATA: ', e.message);
    }
  }
}
