import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from 'src/user/services/user.service';
import { SignUpDto } from '../dto/signUpDto';
import { HashService } from 'src/shared/services/hash.service';
import { SignInDto } from '../dto/signInDto';
import { Public } from 'src/utils/skipAuth';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly hashService: HashService,
  ) {}

  @Public()
  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    const user = await this.userService.createUser({
      username: signUpDto.username,
      hash: await this.hashService.getHash(signUpDto.password),
      email: signUpDto.email,
    });

    const token = await this.authService.signIn(
      signUpDto.username,
      signUpDto.password,
    );

    return token;
  }

  @Public()
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto) {
    const token = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );

    return token;
  }
}
