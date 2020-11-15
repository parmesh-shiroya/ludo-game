import {Injectable} from '@nestjs/common';
import {Server} from 'socket.io';
import {ROOM_SIZE} from 'src/shared/constants';
import {GameService} from '../game/game.service';
import {RedisClientService} from '../redis-client/redis-client.service';


@Injectable()
export class JoinService {

    constructor(private redisClient: RedisClientService, private readonly gameService: GameService) {

    }


    async onRoomCreate(wss: Server, roomId: string) {
        setTimeout(async () => {
            const roomData = roomId.split("_")
            //Check if room has enough users
            // If no add robots to that room and start the game
            if (ROOM_SIZE[roomData[0]] != await this.redisClient.getUsersLengthOfRoom(roomId)) {
                // TODO : Add Robot Users and start Game
                this.gameService.startGame(wss, roomId)
            }
        }, parseInt(process.env.FORCE_START_GAME_TIME))
    }
}
