import { Module, HttpModule } from '@nestjs/common';
import { CompanywxService } from './companywx.service';
import { CompanywxController } from './companywx.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyWx, CompanyWxSchema } from './schemas/companywx.schema';

@Module({
  controllers: [CompanywxController],
  providers: [CompanywxService],
  imports: [HttpModule, MongooseModule.forFeature([{ name: CompanyWx.name, schema: CompanyWxSchema }])],
})
export class CompanywxModule {}
