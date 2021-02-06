import { HttpModule, Module } from '@nestjs/common';
import { WowTokenModule } from 'src/wow-token/wow-token.module';
import { TasksService } from './tasks.service';

@Module({
  imports: [WowTokenModule, HttpModule],
  providers: [TasksService],
})
export class TaskModule {}
