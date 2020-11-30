import {Injectable} from '@nestjs/common';
import {RedisClientService} from '../redis-client/redis-client.service';
import random from 'lodash/random'
import {WebSocketServer} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io'

@Injectable()
export class GameService {
    constructor(private redisClient: RedisClientService) {

    }

    async startGame(wss: Server, roomId: string) {

        // Decide who will be the first

        const currentPlayer = random(0, await this.redisClient.getUsersLengthOfRoom(roomId))

        const players = await this.redisClient.getAllUserOfRoom(`${roomId}_USERS`)
        for (const userId in players) {
            this.redisClient.createUserPiecePositionData(userId)
        }

        this.redisClient.setRoomData(roomId, {currentPlayer})

        //TODO : Remove money from all users account to inProgress game db.

    }

    async endGame(roomId) {

        // Give all the money to who ever wins

        // Delete room.

    }
}
