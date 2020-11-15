import {Module} from '@nestjs/common';
import {RedisClientModule} from '../redis-client/redis-client.module';
import {GameGateway} from './game.gateway';
import {GameService} from './game.service';

@Module({
  providers: [GameGateway, GameService],
  exports: [GameService],
  imports: [RedisClientModule]
})
export class GameModule { }
