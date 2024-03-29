import 'dotenv/config';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {RedisIoAdapter} from "./redis-io.adapter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new RedisIoAdapter(app));
  await app.listen(5555);

}
bootstrap();
