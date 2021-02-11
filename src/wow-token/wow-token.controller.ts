import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { WowToken } from './schemas/wow-token.schema';
import { WowTokenService } from './wow-token.service';
import { WowTokenInterceptor } from './interceptor/wow-token.interceptor';

@Controller('wow-token')
export class WowTokenController {
  constructor(private wowTokenService: WowTokenService) {}

  @UseInterceptors(WowTokenInterceptor)
  @Get('list')
  async findAll(): Promise<WowToken[]> {
    return this.wowTokenService.findAll();
  }
}
