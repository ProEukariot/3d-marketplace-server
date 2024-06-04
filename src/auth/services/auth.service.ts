import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { HashService } from 'src/shared/services/hash.service';
import { UserService } from 'src/user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/typeorm/entities/user';
import { Token } from 'src/shared/types/token';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user) throw new UnauthorizedException(`User ${username} not found`);

    if (!(await this.hashService.compareHash(password, user.hash)))
      throw new UnauthorizedException(`Wrong credentials`);

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    const token: Token = {
      value: await this.jwtService.signAsync({ user: payload }),
    };

    return token;
  }
}
