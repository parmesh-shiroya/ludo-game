import {Module} from '@nestjs/common';
import {RedisModule} from 'nestjs-redis'
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {JoinModule} from './join/join.module';
import {RedisClientModule} from './redis-client/redis-client.module';
import {LoginModule} from './login/login.module';


@Module({
  imports: [
    RedisModule.register({
      name: "main",
      host: 'localhost',
      port: 6379,
      db: 4
    }),
    JoinModule,
    RedisClientModule,
    LoginModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
