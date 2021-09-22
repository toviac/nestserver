import { Test, TestingModule } from '@nestjs/testing';
import { LibReservationService } from './lib-reservation.service';

describe('LibReservationService', () => {
  let service: LibReservationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LibReservationService],
    }).compile();

    service = module.get<LibReservationService>(LibReservationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
