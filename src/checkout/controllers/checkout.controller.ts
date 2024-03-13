import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/utils/skipAuth';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly config: ConfigService) {}

  @Get('testEnv')
  testEnv() {
    return `testEnv return data: ${this.config.get<string>('TEST')}`;
  }
}
