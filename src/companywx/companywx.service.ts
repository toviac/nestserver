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
  private appSecret = 'dLE-8seoo6iVw0aTBuLIqGFxhjpKJJ4hPsQ_8plTaKg';
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
        url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${this.companyId}&corpsecret=${this.appSecret}`,
      })
      .toPromise();
    return token.access_token;
  }

  // { date: 'xxx', successtime: ['xxx', 'xxx', 'xxx'], failedtime: [xxx] }
  async sendMsg(msg) {
    const token = await this.getToken();
    const data = {
      toparty: '1',
      msgtype: 'markdown',
      agentid: this.appId,
      markdown: {
        content: `自习室预约通知
          >自习室: <font color=\"comment\">鼎新图书馆401</font> 
          >日　期: <font color=\"warning\">${msg.date}</font> 
          ${
            msg.successTime?.length
              ? `**预约成功:**\n>时　间: ${msg.successTime
                  .map(time => `<font color=\"info\">${time}</font>`)
                  .join('\n')}`
              : ``
          },
          ${
            msg.failedTime?.length
              ? `**预约失败:**\n>时　间: ${msg.failedTime
                  .map(time => `<font color=\"warning\">${time}</font>`)
                  .join('\n')}`
              : ``
          }`,
      },
      enable_duplicate_check: 0,
      duplicate_check_interval: 1800,
    };
    console.log('contentLength: ', data.markdown.content.length);
    const { data: res } = await this.httpService
      .request({
        method: 'POST',
        url: 'https://qyapi.weixin.qq.com/cgi-bin/message/send',
        params: { access_token: token },
        data: data,
      })
      .toPromise();
    if (res.errmsg === 'ok') {
      return {
        message: '发送成功',
        status: 'success',
      };
    }
    return {
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
