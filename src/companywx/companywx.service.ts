import { Injectable, HttpService } from '@nestjs/common';
import { CompanyWx, CompanyWxDocument } from './schemas/companywx.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CompanywxService {
  constructor(
    private readonly httpService: HttpService,
    @InjectModel('CompanyWx') private companyWxModel: Model<CompanyWxDocument>,
  ) {}

  private companyId = 'wwec48ba9cc66de9a4';
  private appId = '1000002';
  private companySec = 'dLE-8seoo6iVw0aTBuLIqGFxhjpKJJ4hPsQ_8plTaKg';
  private accessToken = '';

  async getToken() {
    // const tokenData: CompanyWx = await this.companyWxModel
    //   .findOne(
    //     {
    //       appId: this.appId,
    //     },
    //     {
    //       token: 1,
    //       appId: 1,
    //       appSecret: 1,
    //       companyId: 1,
    //       updateTime: 1,
    //     },
    //   )
    //   .lean();
    const { data: token } = await this.httpService
      .request({
        method: 'GET',
        url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.companyId}&corpsecret=${this.companySec}`,
      })
      .toPromise();
    return token.access_token;
  }

  // { date: 'xxx', successtime: ['xxx', 'xxx', 'xxx'], failedtime: [xxx] }
  async sendMsg(msg) {
    const token = await this.getToken();
    const data = {
      toparty: '1',
      // msgtype: 'markdown',
      msgtype: 'textcard',
      agentid: this.appId,
      textcard: {
        title: '自习室预约通知',
        description: `<div class=\"gray\">${msg.date}</div>${
          msg.successTime.length
            ? `<div class=\"normal\">预约成功: </div>${msg.successTime
                .map(time => `<div class=\"highlight\">${time}</div>`)
                .join(' ')}`
            : ''
        }${`<div class=\"normal\">预约失败: </div>${msg.failedTime
          .map(time => `<div class=\"highlight\">${time}</div>`)
          .join(' ')}`}`,
        url: 'http://libzwyy.jlu.edu.cn/ClientWeb/m/ic2/Default.aspx',
      },
      markdown: {
        content: `### 自习室预约通知\n自习室: <font color=\"comment\">鼎新图书馆401</font>\n日　期: ${msg.date}\n${
          msg.successTime?.length
            ? `**预约成功:**\n时　间: \n${msg.successTime
                .map(time => `><font color=\"info\">${time}</font>`)
                .join('\n')}\n\n`
            : ``
        }${
          msg.failedTime?.length
            ? `**预约失败:**\n时　间: \n${msg.failedTime
                .map(time => `><font color=\"warning\">${time}</font>`)
                .join('\n')}`
            : ``
        }`,
      },
      enable_duplicate_check: 0,
      duplicate_check_interval: 1800,
    };
    const { data: res } = await this.httpService
      .request({
        method: 'POST',
        url: 'https://qyapi.weixin.qq.com/cgi-bin/message/send',
        params: { access_token: token },
        data: data,
      })
      .toPromise();
    if (res.errmsg === 'ok') {
      console.log(`[${new Date().format()}] SUCCESS_SEND_MSG: `, msg);
      return {
        message: '发送成功',
        status: 'success',
      };
    }
    throw {
      status: 'failed',
      message: res.errmsg,
    };
  }

  findAll() {
    return `This action returns all companywx`;
  }

  findOne(id: number) {
    return `This action returns a #${id} companywx`;
  }

  update(id: number, updateCompanywxDto) {
    return `This action updates a #${id} companywx`;
  }

  remove(id: number) {
    return `This action removes a #${id} companywx`;
  }
}
