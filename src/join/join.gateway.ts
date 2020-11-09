import {Logger, UseGuards} from '@nestjs/common';
import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io'
import {v4 as uuidv4} from 'uuid'
import {NSocket} from "../shared/interfaces/interfaces"
import {RedisClientService} from 'src/redis-client/redis-client.service';
import {WSAuthGuard} from "../shared/wsauth.gaurd"
import {ROOM_TYPE, ROOM_FEE_TYPE} from "../shared/constants"


@WebSocketGateway()
export class JoinGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(private redisClient: RedisClientService) {}


  private logger: Logger = new Logger("JoinGateway")

  afterInit(server: any) {
    this.logger.log("Initialized")
    this.redisClient.setValue("nameqweqwewe", "valuqwee").catch(console.error);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(args)
  }

  @UseGuards(WSAuthGuard)
  @SubscribeMessage('join')
  async handleMessage(client: NSocket, payload: {roomType: ROOM_TYPE, roomFeeType: ROOM_FEE_TYPE}): Promise<string> {

    // find the room from `pending_{roomType}_entryFee
    let roomId = await this.redisClient.getFromHash(`PENDING_${payload.roomType}`, payload.roomFeeType)
    // If not exist create room and save it in redis and run OnRoomCreateInterval for that room
    if (!roomId) {
      roomId = uuidv4()
      this.redisClient.addInHash(`PENDING_${payload.roomType}`, payload.roomFeeType, roomId)
    }

    console.log("join")
    console.log(await this.redisClient.getValue("namewe"))
    return await this.redisClient.getValue("name")
  }


  @SubscribeMessage('message')
  handleMessage2(client: NSocket, payload: {message: string}): string {

    this.wss.to(client.roomId).emit("event", payload.message)


    return ""
  }

  handleDisconnect(client: Socket) {

  }
}
