import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WowToken, WowTokenSchema } from './schemas/wow-token.schema';
import { WowTokenController } from './wow-token.controller';
import { WowTokenService } from './wow-token.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: WowToken.name, schema: WowTokenSchema }])],
  controllers: [WowTokenController],
  providers: [WowTokenService],
  exports: [WowTokenService],
})
export class WowTokenModule {}
