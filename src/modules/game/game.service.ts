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



            this.rollDice(wss, roomId, turnPlayerNo)

        }, 15000)

    }

    async rollDice(wss: Server, roomId: string, playerNo: number) {
        const currentPlayerNo = await this._redisClient.getRoomDataByKey(roomId, 'currentPlayer')
        if (currentPlayerNo != playerNo) { //Check is currentPlayerNo is same as turnPlayer No because in case timeout trigger it dones't run for the player who's is not current player
            return;
        }
        if (this[`TO_ROLL_DICE_${roomId}_${playerNo}`]) {
            clearTimeout(this[`TO_ROLL_DICE_${roomId}_${playerNo}`])
        }
        const diceResult = this._getDiceResult()
        this._redisClient.setRoomData(roomId, {lastDiceResult: diceResult})
        wss.to(roomId).emit("WE_DICE_RESULT", {playerNo, result: diceResult})
        //TODO: Check are ther any piece that can be moved if not trigger next player and reutnr
        this[`TO_MOVE_PIECE_${roomId}_${playerNo}`] = setTimeout(async () => {
            // TODO: Find the bset possible move
            this.movePiece(wss, roomId, playerNo, 0)
        }, 15000)
    }

    async movePiece(wss: Server, roomId: string, playerNo: number, movePeice: number) {
        const currentPlayerNo = await this._redisClient.getRoomDataByKey(roomId, 'currentPlayer')
        if (currentPlayerNo != playerNo) {
            return;
        }
        // Move the piece player choose
        //TODO: Send every piece's new position in room
        //Check is current player should be next player or next player should be next player and start nexplayers turn
    }

    _getDiceResult(): number {
        return random(0, 7)
    }

    async getMovablePieces(roomId: string, currentPlayerNo: number, diceResult: string) {
        const allUsers = await this._redisClient.getAllUserOfRoom(roomId)
        const playersData = {}
        for (let i = 0; i < 4; i++) {
            if (allUsers[i]) {
                let playerPiece = await this._redisClient.getUserPiecePosition(allUsers[i])
                playersData[i] = {
                    userId: allUsers[i],
                    no: i, piece: [
                        playerPiece[0],
                        playerPiece[1],
                        playerPiece[2],
                        playerPiece[3],
                    ]
                }
            }
        }
        let currentPlayerPiecePos = 0; // just for log
        const findTheNextBestRandomNoForBot = []
        const currentPlayerData = playersData[currentPlayerNo]
        for (let currentPiecePosition of currentPlayerData.piece) {
            currentPlayerPiecePos++;
            if ([0, 52, 53, 54, 55, 56, 57].includes(currentPiecePosition)) // if currentPlayer's position are somewhere whatever number come it can't kill anyone then ignore it.
                continue;
            // Loop through other players
            for (let playerKey of Object.keys(playersData).filter(k => k != currentPlayerNo.toString())) {
                // Find the piecePosForCurrentPlayer between other players pieces
                let comparePlayerData = playersData[playerKey]
                let piecePos = 0; // Just for logs
                // Loop through all other player's piece
                for (let comparePiecePosition of comparePlayerData.piece) {
                    piecePos++;
                    // If other's player piece are in safe zone ignore it
                    if ([0, 1, 9, 14, 22, 27, 35, 40, 48, 52, 53, 54, 55, 56, 57].includes(comparePiecePosition))
                        continue;
                    // Important :  Find What is other's player piece's position is for current player.Ex. if player 2's piece is in 8 then for player'1 that piece is in 21
                    let piecePosForCurrentPlayer = (13 * this._distanceBetweenPlayer(currentPlayerData.no, comparePlayerData.no)) + comparePiecePosition;
                    // If the answer is more than 52 then minus it from 53. Ex. Player3's pos is 18 in that above formula will give answer 57. it's not possible answer should be 5. So 57-52 = 5
                    if (piecePosForCurrentPlayer > 52) {
                        piecePosForCurrentPlayer -= 52
                    }
                    // Calculate the distance between currentPlayer's price and the oponent's player peice
                    let distanceFromCurrentPlayerPiece = piecePosForCurrentPlayer - currentPiecePosition;
                    //If it's between 0to 7 then save it in findTheNextBestRandomNoForBot
                    if (distanceFromCurrentPlayerPiece > 0 && distanceFromCurrentPlayerPiece < 7) {
                        findTheNextBestRandomNoForBot.push(distanceFromCurrentPlayerPiece)
                        console.log("nextLineIsKill")
                    }
                    console.log(`${playerKey}'s piece ${piecePos}(${comparePiecePosition}) is ${distanceFromCurrentPlayerPiece} moves far from ${currentPlayerNo}'s piece ${currentPlayerPiecePos} (${currentPiecePosition})`)
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
