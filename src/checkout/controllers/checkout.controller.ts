import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/utils/skip-auth';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../constants';

@Controller('checkout')
export class CheckoutController {
  constructor(@Inject(STRIPE_CLIENT) private stripe: Stripe) {}

  @Public()
  @Get('test')
  async test() {
    const clients = await this.stripe.customers.list();

    console.log(clients);

    return clients;
  }
}
