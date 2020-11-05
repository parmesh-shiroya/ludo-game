import {Socket} from 'socket.io'

export interface NSocket extends Socket {
    roomId: string
}

