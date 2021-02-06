import { Test, TestingModule } from '@nestjs/testing';
import { WowTokenController } from './wow-token.controller';

describe('WowTokenController', () => {
  let controller: WowTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WowTokenController],
    }).compile();

    controller = module.get<WowTokenController>(WowTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
