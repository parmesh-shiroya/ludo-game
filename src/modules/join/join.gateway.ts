import {Logger, UseGuards} from '@nestjs/common';
import {OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsResponse} from '@nestjs/websockets';
import {Socket, Server} from 'socket.io'
import {PLAYER_STATUS, ROOM_FEE_TYPE, ROOM_SIZE, ROOM_TYPE} from 'src/shared/constants';
import {WSAuthGuard} from 'src/shared/wsauth.gaurd';
import {v4 as uuidv4} from 'uuid'
import {NSocket} from "../../shared/interfaces/interfaces"
import {GameService} from '../game/game.service';
import {RedisClientService} from '../redis-client/redis-client.service';
import {JoinService} from './join.service';


@WebSocketGateway()
export class JoinGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wss: Server;

  constructor(private readonly redisClient: RedisClientService, private readonly joinService: JoinService, private readonly gameService: GameService) {

  }


  private logger: Logger = new Logger("JoinGateway")

  afterInit(server: any) {
    this.logger.log("Initialized")
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(args)
  }

  @UseGuards(WSAuthGuard)
  @SubscribeMessage('join')
  async handleMessage(client: NSocket, payload: {roomType: ROOM_TYPE, roomFeeType: ROOM_FEE_TYPE}): Promise<WsResponse<string>> {


    // TODO : Check user has enough balance to join in the game

    // find the room from `pending_{roomType}_entryFee
    let roomId = await this.redisClient.getPendingRoomId(payload.roomType, payload.roomFeeType)

    // If not exist create room and save it in redis and run OnRoomCreateInterval for that room
    if (!roomId) {
      roomId = `${payload.roomType}_${payload.roomFeeType}_${uuidv4()}`
      await this.redisClient.createPendingRoom(payload.roomType, payload.roomFeeType, roomId)
      this.joinService.onRoomCreate(this.wss, roomId)
    }
    const playersInRoom = await this.redisClient.getUsersLengthOfRoom(roomId)
    await this.redisClient.addUserInRooms(`${roomId}_USERS`, {userId: client.userId, playerNo: playersInRoom})
    // Set players data in redis
    await this.redisClient.setUserData(client.userId, {socketId: client.id, name: client.name, roomId, status: PLAYER_STATUS.PLAYING, playerNo: playersInRoom})
    client.join(roomId)
    client.roomId = roomId

    const roomSize = ROOM_SIZE[payload.roomType]
    if (playersInRoom == roomSize) {
      // Start Game;
      this.gameService.startGame(this.wss, roomId)
    }
    // TODO : Get Users data from Db
    const user = {id: client.userId, name: client.name}
    // Notify all in room that user is joined with joined user's data.
    this.wss.to(roomId).emit("userJoined", {user})
    return {event: "join", data: roomId}
  }


  @SubscribeMessage('message')
  handleMessage2(client: NSocket, payload: {message: string}): string {

    this.wss.to(client.roomId).emit("event", payload.message)


    return ""
  }

  handleDisconnect(client: Socket) {

  }
}
