import {Module} from '@nestjs/common';
import {GameModule} from '../game/game.module';
import {RedisClientModule} from '../redis-client/redis-client.module';
import {JoinGateway} from './join.gateway';
import {JoinService} from './join.service';

@Module({
  providers: [JoinGateway, JoinService],
  imports: [RedisClientModule, GameModule]
})
export class JoinModule { }
