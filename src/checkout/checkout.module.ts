import { Module } from '@nestjs/common';
import { CheckoutController } from './controllers/checkout.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [CheckoutController],
  imports: [],
})
export class CheckoutModule {}
