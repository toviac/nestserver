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
    const today = new Date();
    const nextDate = new Date(today.setDate(today.getDate() + 1));
    const formattedDate = nextDate.format('yyyy-MM-dd');
    return this.companywxService.sendMsg({
      date: formattedDate,
      successTime: ['fasd', 'asdf'],
      failedTime: ['afsd', 'fasdf'],
    });
  }
}
