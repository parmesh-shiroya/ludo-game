import {Injectable, Logger} from '@nestjs/common';
import {RedisService} from 'nestjs-redis';
import * as Redis from 'ioredis';
import {NSocket} from 'src/shared/interfaces/interfaces';
import {ROOM_FEE_TYPE, ROOM_TYPE} from 'src/shared/constants';


@Injectable()
export class RedisClientService {
    private _client: Redis.Redis
    private logger: Logger = new Logger("RedisClientService")
    constructor(private readonly redisService: RedisService) {
        this.logger.verbose("constructor")
        this._client = this.redisService.getClient('main');
    }

    async getClient(): Promise<Redis.Redis> {
        const client = this.redisService.getClient('main');
        return client;
    }


    /*
    * All method for `PENDING_${roomType}`
    */
    // Create Pending Room
    async createPendingRoom(roomType: ROOM_TYPE, roomFeeType: ROOM_FEE_TYPE, roomId: string): Promise<Boolean> {
        const result = await this._client.hmset(`PENDING_${roomType}`, {[roomFeeType]: roomId})
        return result == 'OK';
    }
    // Get Pending roomId by roomType and roomFeeType
    async getPendingRoomId(roomType: ROOM_TYPE, roomFeeType: ROOM_FEE_TYPE): Promise<string> {
        return await this._client.hget(`PENDING_${roomType}`, roomFeeType)
    }
    /*
    * End method for `PENDING_${roomType}`
    */


    /*
    * All method for `${roomId}_USERS`
    */
    // Create record of which roomId containt which users. ex. {@roomId}_USERS:{@userId:@clientId,@userId2:@clientId2}}
    async addUserInRooms(roomId: string, client: NSocket): Promise<boolean> {
        const result = await this._client.hmset(`${roomId}_USERS`, {[client.userId]: client.id})
        return result == 'OK';
    }

    async getUsersLengthOfRoom(roomId: string): Promise<number> {
        return this._client.hlen(`${roomId}_USERS`)
    }

    async getAllUserOfRoom(roomId: string): Promise<Record<string, string>> {
        return this._client.hgetall(`${roomId}_USERS`)
    }
    /*
    * END methods for `${roomId}_USERS`
    */


    /*
    * All method for `${userId}_DATA` = {roomId, status, playerNo}
    */
    // Save user data to know which room they are in and what is the current status of user
    async addUser(userId: string, roomId: string, status: string, playerNo: number): Promise<Boolean> {
        const result = await this._client.hmset(`${userId}_DATA`, {roomId, status, playerNo})
        return result == 'OK';
    }
    /*
    * End method for `${userId}_DATA` = {roomId, status, playerNo}
    */

    /*
    * Add method for `${userId}_PIECES` : [0,0,0,0]
    */
    //
    async createUserPiecePositionData(userId: string): Promise<number> {
        return await this._client.lpush(`${userId}_PIECES`, 0, 0, 0, 0)
    }


    async setUserPiecePosition(userId: string, pieceNo: number, position: number): Promise<Boolean> {
        const result = await this._client.lset(`${userId}_PIECES`, pieceNo, position)
        return result == 'OK';
    }
}
