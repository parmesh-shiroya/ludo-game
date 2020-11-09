import {Module} from '@nestjs/common';
import {RedisModule} from 'nestjs-redis'
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {JoinGateway} from './join/join.gateway';
import {GameGateway} from './game/game.gateway';
import {RedisClientService} from './redis-client/redis-client.service';
import {LoginGateway} from './login/login.gateway';

@Module({
  imports: [
    RedisModule.register({
      name: "main",
      host: 'localhost',
      port: 6379,
      db: 4
    })
  ],
  controllers: [AppController],
  providers: [AppService, JoinGateway, GameGateway, RedisClientService, LoginGateway],
})
export class AppModule {}
