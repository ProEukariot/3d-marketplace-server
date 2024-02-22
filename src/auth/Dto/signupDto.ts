import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { CompareTo } from 'src/shared/validators/compareTo';
import { isUnique } from 'src/shared/validators//isUnique';

export class SignUpDto {
  @Length(8, 20)
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  @isUnique({ table: 'user', column: 'username' })
  username: string;

  @Length(8, 20)
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  password: string;

  @IsString()
  @CompareTo('password')
  confirmPassword: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @isUnique({ table: 'user', column: 'email' })
  email: string;
}
