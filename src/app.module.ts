import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonMiddleware } from './common/middlewares/common.middleware';
import { OotdifussionModule } from './modules/ootdifussion/ootdifussion.module';

@Module({
  imports: [OotdifussionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CommonMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
