import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UserService } from 'src/user/services/user.service';
import { SignUpDto } from '../Dto/signupDto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  async createUser(@Body() signupDto: SignUpDto) {
    const user = await this.userService.createUser({
      username: signupDto.username,
      hash: signupDto.password,
      email: signupDto.email,
    });

    return { id: user.id };
    return 'TOKEN';
  }
}
