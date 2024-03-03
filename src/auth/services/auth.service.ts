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
import { User } from 'src/typeorm/entities/User';
import { Token } from 'src/shared/types/Token';

@Injectable()
export class AuthService {
  private logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string) {
    let user: User;

    try {
      user = await this.userService.getUserByUsername(username);
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(`User ${username} not found`);
    }

    if (!(await this.hashService.compareHash(password, user.hash)))
      throw new UnauthorizedException(`Wrong password`);

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
    };

    const token: Token = { value: await this.jwtService.signAsync(payload) };

    return token;
  }
}
