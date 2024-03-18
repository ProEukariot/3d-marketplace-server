import { registerAs } from '@nestjs/config';
import { StripeConfig } from 'interfaces/stripe-config.innterface';

export default registerAs('stripe', () : StripeConfig => ({
  apiKey: process.env.STRIPE_KEY,
}));
