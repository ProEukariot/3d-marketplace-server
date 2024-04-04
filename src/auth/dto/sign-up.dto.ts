import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { CompareTo } from 'src/shared/validators/compare-to';
import { isUnique } from 'src/shared/validators/is-unique';

export class SignUpDto {
  @Length(8, 20)
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]+$/)
  @isUnique({ table: 'users', column: 'username' })
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
  @IsEmail({}, { message: 'Email must be an email!' })
  @isUnique({ table: 'users', column: 'email' })
  email: string;
}
