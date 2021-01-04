import {Socket} from 'socket.io'
import {PLAYER_STATUS, ROOM_TYPE} from "../constants"
export interface NSocket extends Socket {
    roomId: string,
    user?: object,
    token: string,
    userId: string,
    name: string
}

//####### Redis Interfaces ######//
export interface ROOM_DATA {
    currentPlayer?: number,
    roomSize?: number,
    lastDiceResult?: number
}

export interface USER_DATA {
    userId?: string,
    socketId?: string,
    name: string,
    roomId: string,
    status: PLAYER_STATUS,
    playerNo: number,
}