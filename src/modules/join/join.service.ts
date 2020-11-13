import {Injectable} from '@nestjs/common';
import {RedisClientService} from 'src/redis-client/redis-client.service';

@Injectable()
export class JoinService {

    constructor(private redisClient: RedisClientService) {

    }


    onRoomCreate = async (roomId) => {
        setInterval(() => {

        }, parseInt(process.env.FORCE_START_GAME_TIME))
    }
}
