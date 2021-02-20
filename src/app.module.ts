import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DB_URL } from '../config/config.js';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { PostModule } from './post/post.module';
import { ScheduleModule } from '@nestjs/schedule';
import { WowTokenModule } from './wow-token/wow-token.module';
import { TaskModule } from './tasks/tasks.module';
import { ChatModule } from './chat/chat.module';
import { DrawModule } from './draw-something/draw.module';

@Module({
  imports: [
    // 这里的 { useCreateIndex: true } 是为了解决
    // https://mongoosejs.com/docs/deprecations.html#ensure Index()的报错
    MongooseModule.forRoot(DB_URL, { useCreateIndex: true }),
    PostModule,
    ScheduleModule.forRoot(),
    TaskModule,
    WowTokenModule,
    ChatModule,
    DrawModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ method: RequestMethod.GET, path: 'wow-token' });
  }
}
