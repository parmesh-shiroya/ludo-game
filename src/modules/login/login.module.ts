import { Module } from '@nestjs/common';
import { LoginGateway } from './login.gateway';

@Module({
  providers: [LoginGateway]
})
export class LoginModule {}
