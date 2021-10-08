import { Test, TestingModule } from '@nestjs/testing';
import { CompanywxService } from './companywx.service';

describe('CompanywxService', () => {
  let service: CompanywxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompanywxService],
    }).compile();

    service = module.get<CompanywxService>(CompanywxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
