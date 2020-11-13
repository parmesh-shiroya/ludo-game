import {Module} from '@nestjs/common';
import {RedisClientModule} from '../redis-client/redis-client.module';
import {JoinGateway} from './join.gateway';
import {JoinService} from './join.service';

@Module({
  providers: [JoinGateway, JoinService],
  imports: [RedisClientModule]
})
export class JoinModule { }
