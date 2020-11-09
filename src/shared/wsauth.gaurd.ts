import {
    Injectable,
    CanActivate,
    ExecutionContext,
} from '@nestjs/common';
import {WsException} from "@nestjs/websockets"
import * as jwt from 'jsonwebtoken';


@Injectable()
export class WSAuthGuard implements CanActivate {

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToWs().getClient();
        console.log(request.token)
        if (!request || !request.token)
            return false;
        // TODO: Is Below line required to execute on every WS event
        // request.user = await this.validateToken(request.token);
        return true;

    }

    async validateToken(auth: string) {
        try {
            const decoded: any = await jwt.verify(auth, process.env.SECRET);
            return decoded;
        } catch (err) {
            const message = 'Token error: ' + (err.message || err.name);
            throw new WsException(message);
        }
    }
}