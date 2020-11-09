import {SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import {NSocket} from "../shared/interfaces/interfaces"

@WebSocketGateway()
export class GameGateway {
  @SubscribeMessage('message')
  handleMessage(client: NSocket, payload: any): string {
    console.log("game", client.roomId)
    return 'Hello world!';
  }
}
