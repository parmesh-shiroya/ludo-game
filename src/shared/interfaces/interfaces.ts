import {Socket} from 'socket.io'

export interface NSocket extends Socket {
    roomId: string,
    user?: object,
    token: string,
    userId: string,
    name: string
}

