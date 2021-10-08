import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompanywxService } from './companywx.service';

interface wxMsg {
  date: string;
  successTime: string[];
  failedTime: string[];
}

@Controller('companywx')
export class CompanywxController {
  constructor(private readonly companywxService: CompanywxService) {}

  @Post()
  sendMsg(@Body() msg: wxMsg) {
    return this.companywxService.sendMsg({
      date: msg.date,
      successTime: msg.successTime,
      failedTime: msg.failedTime,
    });
  }

  @Get()
  findAll() {
    return this.companywxService.sendMsg({
      date: '2021-10-09',
      successTime: ['8:30 - 12:30', '13:00 - 17:00', '18:00 - 21:30'],
      failedTime: ['8:30 - 12:30', '13:00 - 17:00', '18:00 - 21:30'],
    });
  }
}
