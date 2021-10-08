import { Test, TestingModule } from '@nestjs/testing';
import { CompanywxController } from './companywx.controller';
import { CompanywxService } from './companywx.service';

describe('CompanywxController', () => {
  let controller: CompanywxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanywxController],
      providers: [CompanywxService],
    }).compile();

    controller = module.get<CompanywxController>(CompanywxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
