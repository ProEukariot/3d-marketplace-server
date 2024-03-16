import { ApiProperty } from '@nestjs/swagger';

export class SignInDto {
  username: string;

  password: string;
}
