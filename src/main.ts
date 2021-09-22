import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import './utils/format.js';

async function bootstrap() {
  // @ts-ignore
  Date.prototype.format = function (fmt) {
    const o = {
      'M+': this.getMonth() + 1, //月份
      'd+': this.getDate(), //日
      'h+': this.getHours(), //小时
      'm+': this.getMinutes(), //分
      's+': this.getSeconds(), //秒
      'q+': Math.floor((this.getMonth() + 3) / 3), //季度
      S: this.getMilliseconds(), //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
      }
    }
    return fmt;
  };
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.listen(7001);
  console.log('server running at http://localhost:7001');
}
bootstrap();
