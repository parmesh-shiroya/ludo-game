import {Injectable} from '@nestjs/common';
import {RedisClientService} from '../redis-client/redis-client.service';
import random from 'lodash/random'
import {WebSocketServer} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io'
import {USER_DATA} from 'src/shared/interfaces/interfaces';

@Injectable()
export class GameService {
    constructor(private readonly _redisClient: RedisClientService) {

    }

    async _getNextPlayerNo(roomId: string, currentPlayerNo: number = -1): Promise<number> {
        const allPlayers = await this._redisClient.getAllUserOfRoom(roomId)
        let nextPlayerNo = currentPlayerNo + 1
        for (let i = 0; i < Object.keys(allPlayers).length; i++) {
            if (allPlayers[nextPlayerNo])
                return nextPlayerNo;
            if (nextPlayerNo >= Object.keys(allPlayers).length)
                nextPlayerNo = 0
            nextPlayerNo++;
        }
    }

    async startGame(wss: Server, roomId: string) {

        // Decide who will be the first
        const fullRoomData = await this._redisClient.getFullRoomData(roomId)
        //TODO : Remove money from all users account to inProgress game db.
        wss.to(roomId).emit('WE_GAME_START', fullRoomData)

        const users = fullRoomData.users;
        for (const user of users) {
            await this._redisClient.createUserPiecePositionData(user.userId)
        }
        this._redisClient.setRoomData(roomId, {roomSize: users.length})
        const currentPlayerNo = await this._getNextPlayerNo(roomId)
        this._playTurn(wss, roomId, currentPlayerNo)
    }

    async _playTurn(wss: Server, roomId: string, turnPlayerNo: number) {
        this._redisClient.setRoomData(roomId, {currentPlayer: turnPlayerNo})
        wss.to(roomId).emit('WE_PLAY_TURN', {playerNo: turnPlayerNo})
        this[`TO_ROLL_DICE_${roomId}_${turnPlayerNo}`] = setTimeout(async () => {
            const currentPlayerNo = await this._redisClient.getRoomDataByKey(roomId, 'currentPlayer')
            if (currentPlayerNo == turnPlayerNo) {
                this.rollDice(wss, roomId, turnPlayerNo)
            }
        }, 15000)

    }

    async rollDice(wss: Server, roomId: string, playerNo: number) {
        if (this[`TO_ROLL_DICE_${roomId}_${playerNo}`]) {
            clearTimeout(this[`TO_ROLL_DICE_${roomId}_${playerNo}`])
        }
        const diceResult = this._getDiceResult()
        this._redisClient.setRoomData(roomId, {lastDiceResult: diceResult})

    }

    _getDiceResult(): number {
        return random(0, 7)
    }

    async getMovablePieces(roomId: string, playerNo: number, diceResult: string) {
        const allUsers = await this._redisClient.getAllUserOfRoom(roomId)
        const playersPieceNumber = {}
        for (let i = 0; i < 4; i++) {
            if (allUsers[i]) {
                let playerPiece = await this._redisClient.getUserPiecePosition(allUsers[i])
                playersPieceNumber[allUsers[i]] = {
                    no: i, piece: [
                        playerPiece[0],
                        playerPiece[1],
                        playerPiece[2],
                        playerPiece[3],
                    ]
                }
            }
        }

    }


    _distanceBetweenPlayer(currentPlayer: number, comparePlayer: number): number {
        let array = [0, 1, 2, 3]
        let distance = 0;
        for (let index = currentPlayer; index < array.length + currentPlayer; index++) {
            let fIndex = index;
            if (index >= array.length)
                fIndex = index - array.length
            if (array[fIndex] == comparePlayer) {
                break;
            }
            distance++;
        }
        return distance;
    }


    async endGame(roomId) {

        // Give all the money to who ever wins

        // Delete room.

    }
}
