import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from 'src/user/services/user.service';
import { SignUpDto } from '../Dto/signupDto';
import { HashService } from 'src/shared/services/hash.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
  ) {}

  @Post('signup')
  async createUser(@Body() signupDto: SignUpDto) {
    const user = await this.userService.createUser({
      username: signupDto.username,
      hash: await this.hashService.getHash(signupDto.password),
      email: signupDto.email,
    });

    const token = await this.authService.signIn(
      signupDto.username,
      signupDto.password,
    );

    return token;
  }
}
