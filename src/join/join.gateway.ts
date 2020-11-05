import {Logger} from '@nestjs/common';
import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io'
import {NSocket} from "../interfaces/interfaces"



@WebSocketGateway()
export class JoinGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  private logger: Logger = new Logger("JoinGateway")

  afterInit(server: any) {
    this.logger.log("Initialized")
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(args)
  }

  @SubscribeMessage('join')
  handleMessage(client: NSocket, payload: {roomName: string}): string {

    client.join(payload.roomName)
    client.roomId = payload.roomName;
    console.log("join")
    return ""
  }


  @SubscribeMessage('message')
  handleMessage2(client: NSocket, payload: {message: string}): string {

    this.wss.to(client.roomId).emit("event", payload.message)


    return ""
  }

  handleDisconnect(client: Socket) {

  }
}
