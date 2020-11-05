import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JoinGateway } from './join/join.gateway';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, JoinGateway, GameGateway],
})
export class AppModule {}
