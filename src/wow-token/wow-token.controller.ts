import { Controller, Get } from '@nestjs/common';
import { WowToken } from './schemas/wow-token.schema';
import { WowTokenService } from './wow-token.service';

@Controller('wow-token')
export class WowTokenController {
  constructor(private wowTokenService: WowTokenService) {}

  @Get('list')
  async findAll(): Promise<WowToken[]> {
    console.log('list');
    return this.wowTokenService.findAll();
  }
}
