import { Module } from '@nestjs/common';
import { ChatRoomGateway } from './chat-room.gateway';

@Module({
  providers: [ChatRoomGateway],
})
export class ChatRoomModule {}
