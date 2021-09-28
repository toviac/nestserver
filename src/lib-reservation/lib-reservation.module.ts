import { HttpModule, Module } from '@nestjs/common';
import { LibReservationService } from './lib-reservation.service';
import { MongooseModule } from '@nestjs/mongoose';
import { LibReservation, LibReservationSchema } from './schemas/lib-reservation.schema';

@Module({
  imports: [HttpModule, MongooseModule.forFeature([{ name: LibReservation.name, schema: LibReservationSchema }])],
  providers: [LibReservationService],
})
export class LibReservationModule {}
