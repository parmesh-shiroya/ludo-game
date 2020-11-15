import {Module} from '@nestjs/common';
import {RedisModule} from 'nestjs-redis'
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {JoinModule} from './modules/join/join.module';
import {LoginModule} from './modules/login/login.module';
import {RedisClientModule} from './modules/redis-client/redis-client.module';
import { GameModule } from './modules/game/game.module';



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
    LoginModule,
    GameModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule { }
