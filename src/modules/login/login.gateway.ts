import {SubscribeMessage, WebSocketGateway} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import {LOGIN_TYPE} from 'src/shared/constants';
import {v4 as uuidv4} from 'uuid'


@WebSocketGateway()
export class LoginGateway {
  @SubscribeMessage('login_guest')
  handleMessage(client: any, payload: {token?: string, deviceId: string}): {token: string, userId: string} {
    let jwtToken = payload.token;
    let userId;
    // If token not exist create new token
    if (!payload.token) {
      userId = uuidv4()
      jwtToken = jwt.sign(
        {
          deviceId: payload.deviceId,
          userId,
          loginFrom: LOGIN_TYPE.GUEST,
          time: new Date().getTime()
        }, process.env.SECRET,
        {
          expiresIn: process.env.JWT_EXPIRY_TIME
        })
    } else {
      //TODO : verify Token and set userId = token.userId
      // let userId =
    }
    //assign token to client Socket
    client.token = jwtToken;
    client.userId = userId;
    return {token: jwtToken, userId};
  }
}
