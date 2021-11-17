import { Module, HttpModule, OnModuleInit, HttpService } from '@nestjs/common';
import { CompanywxService } from './companywx.service';
import { CompanywxController } from './companywx.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyWx, CompanyWxSchema } from './schemas/companywx.schema';

@Module({
  controllers: [CompanywxController],
  providers: [CompanywxService],
  imports: [HttpModule, MongooseModule.forFeature([{ name: CompanyWx.name, schema: CompanyWxSchema }])],
})
// https://www.jianshu.com/p/ba1ca0bc87b5
// https://juejin.cn/post/6968487137670856711
export class CompanywxModule implements OnModuleInit {
  constructor(private httpService: HttpService) {}
  public onModuleInit() {
    this.httpService.axiosRef.interceptors.response.use(
      response => {
        return response;
      },
      err => {
        console.log(`[${new Date().format()}] ERR_RESPONSE, RETRYING...`);
        const config = err.config;
        if (!config) return Promise.reject(err);
        // retry 具体接口配置的重发次数
        const retry = 5;
        // 设置用于记录重试计数的变量 默认为0
        config.__retryCount = config.__retryCount || 0;

        // 判断是否超过了重试次数
        if (config.__retryCount >= retry) {
          return Promise.reject(err);
        }
        // 重试次数
        config.__retryCount += 1;

        // 延时处理
        const backoff = new Promise(function (resolve) {
          setTimeout(function () {
            resolve(0);
          }, config.retryDelay || 500);
        });
        // 重新发起axios请求
        return backoff.then(function () {
          // 判断是否是JSON字符串
          // TODO: 未确认config.data再重发时变为字符串的原因
          if (config.data) {
            config.data = JSON.parse(config.data);
          }
          return this.httpService(config);
        });
      },
    );
  }
}
