import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsModule } from './cats/cats.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { EventsModule } from './events/events.module';
import { PostModule } from './post/post.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WowTokenModule } from './wow-token/wow-token.module';
import { TaskModule } from './tasks/tasks.module';
import { ChatRoomModule } from './chat-room/chat-room.module';

@Module({
  imports: [
    CatsModule,
    EventsModule,
    MongooseModule.forRoot('mongodb://manager:main_db_manager@89.208.248.23:27017/main'),
    PostModule,
    ScheduleModule.forRoot(),
    TaskModule,
    WowTokenModule,
    ChatRoomModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ method: RequestMethod.GET, path: 'wow-token' });
  }
}
