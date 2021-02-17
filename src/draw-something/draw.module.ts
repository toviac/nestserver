import { Module } from '@nestjs/common';
import { DrawGateway } from './draw.gateway';
import { ChatModule } from '../chat/chat.module';

@Module({
  providers: [DrawGateway],
  imports: [ChatModule],
})
export class DrawModule {}
