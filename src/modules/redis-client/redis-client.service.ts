import {Injectable, Logger} from '@nestjs/common';
import {RedisService} from 'nestjs-redis';
import * as Redis from 'ioredis';
import {NSocket, ROOM_DATA, USER_DATA} from 'src/shared/interfaces/interfaces';
import {PLAYER_STATUS, ROOM_FEE_TYPE, ROOM_TYPE} from 'src/shared/constants';
import {stat} from 'fs';


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
        const result = await this._client.hmset(`PENDING_${roomType}_ROOM`, {[roomFeeType]: roomId})
        return result == 'OK';
    }
    // Get Pending roomId by roomType and roomFeeType
    async getPendingRoomId(roomType: ROOM_TYPE, roomFeeType: ROOM_FEE_TYPE): Promise<string> {
        return await this._client.hget(`PENDING_${roomType}_ROOM`, roomFeeType)
    }
    /*
    * End method for `PENDING_${roomType}`
    */


    /*
    * All method for `${roomId}_USERS`
    */
    // Create record of which roomId containt which users. ex. {@roomId}_USERS:{@userId:@clientId,@userId2:@clientId2}}
    async addUserInRooms(roomId: string, {userId, playerNo}: {playerNo: number, userId: string}): Promise<boolean> {
        const result = await this._client.hmset(`ROOM_${roomId}_USERS`, {[playerNo]: userId})
        return result == 'OK';
    }

    async getUsersLengthOfRoom(roomId: string): Promise<number> {
        return this._client.hlen(`ROOM_${roomId}_USERS`)
    }

    async getAllUserOfRoom(roomId: string): Promise<Record<string, string>> {
        return this._client.hgetall(`ROOM_${roomId}_USERS`)
    }
    /*
    * END methods for `${roomId}_USERS`
    */
    /*
     * All method for `${roomId}_DATA` = {currentPlayerNo, roomCreatedAt}
     */

    async setRoomData(roomId: string, data: ROOM_DATA) {
        const result = await this._client.hmset(`ROOM_${roomId}_DATA`, data as unknown as Record<string, string | number>)
        return result == 'OK';
    }

    async getRoomData(roomId: string): Promise<ROOM_DATA> {
        return (await this._client.hgetall(`ROOM_${roomId}_DATA`)) as unknown as ROOM_DATA
    }

    async getRoomDataByKey(roomId: string, key: string): Promise<string | number> {
        return this._client.hget(`ROOM_${roomId}_DATA`, key)
    }

    /*
    * End method for `${roomId}_DATA` = {currentPlayerNo, roomCreatedAt}
    */
    /*
    * All method for `${userId}_DATA` = {roomId, status, playerNo}
    */
    // Save user data to know which room they are in and what is the current status of user
    async setUserData(userId, {socketId, roomId, status, playerNo, name}: USER_DATA): Promise<Boolean> {
        const result = await this._client.hmset(`USER_${userId}_DATA`, {socketId, roomId, status, playerNo, name})
        return result == 'OK';
    }

    async getUserData(userId): Promise<USER_DATA> {
        return (await this._client.hgetall(`USER_${userId}_DATA`)) as unknown as USER_DATA
    }
    /*
    * End method for `${userId}_DATA` = {roomId, status, playerNo}
    */

    /*
    * Add method for `${userId}_PIECES` : [0,0,0,0]
    */
    //TODO: Check is it ok to make this as list and not as object(sets)
    async createUserPiecePositionData(userId: string): Promise<Boolean> {
        const result = await this._client.hmset(`USER_${userId}_PIECES`, {0: 0, 1: 0, 2: 0, 3: 0})
        return result == 'OK';
    }


    async setUserPiecePosition(userId: string, pieceNo: number, position: number): Promise<Boolean> {
        const result = await this._client.hset(`USER_${userId}_PIECES`, {[pieceNo]: position})
        return result == 'OK';
    }

    async getUserPiecePosition(userId: string): Promise<Record<string, string>> {
        return await this._client.hgetall(`USER_${userId}_PIECES`)
    }

    /*
    * Extra method to fetch multipleData at once
    */
    async getFullRoomData(roomId: string): Promise<{roomData: object, users: USER_DATA[]}> {
        const roomData = await this.getRoomData(roomId)
        const roomUsersList = await this.getAllUserOfRoom(roomId)
        const users = []
        for (const userId of Object.values(roomUsersList)) {
            const userData = await this.getUserData(userId)
            userData.userId = userId;
            users[userData.playerNo] = userData
        }
        return {roomData, users}
    }

}
