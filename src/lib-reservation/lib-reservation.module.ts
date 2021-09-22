import { HttpModule, Module } from '@nestjs/common';
import { LibReservationService } from './lib-reservation.service';

@Module({
  imports: [HttpModule],
  providers: [LibReservationService],
})
export class LibReservationModule {}
