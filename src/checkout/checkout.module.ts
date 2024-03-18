import { Module } from '@nestjs/common';
import { CheckoutController } from './controllers/checkout.controller';
import { StripeModule } from 'src/stripe/stripe.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Models3dModule } from 'src/models3d/model3d.module';

@Module({
  controllers: [CheckoutController],
  imports: [
    StripeModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        key: configService.get('stripe.apiKey'),
      }),
    }),
    ConfigModule,
    Models3dModule
  ],
})
export class CheckoutModule {}
