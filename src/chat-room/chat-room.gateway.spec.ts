import { Test, TestingModule } from '@nestjs/testing';
import { ChatRoomGateway } from './chat-room.gateway';

describe('ChatRoomGateway', () => {
  let gateway: ChatRoomGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChatRoomGateway],
    }).compile();

    gateway = module.get<ChatRoomGateway>(ChatRoomGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
