import { Test, TestingModule } from '@nestjs/testing';
import { WowTokenService } from './wow-token.service';

describe('WowTokenService', () => {
  let service: WowTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WowTokenService],
    }).compile();

    service = module.get<WowTokenService>(WowTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
