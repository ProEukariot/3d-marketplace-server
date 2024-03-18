import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  InternalServerErrorException,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/utils/skip-auth';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../constants';
import { ServerConfig } from 'interfaces/server-config.interface';
import { Model3dService } from 'src/models3d/services/model3d.service';
import { StripeConfig } from 'interfaces/stripe-config.innterface';

@Controller('checkout')
export class CheckoutController {
  constructor(
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
    private readonly config: ConfigService,
    private readonly model3dService: Model3dService,
  ) {}

  @Public()
  @Post('create-session')
  async createCheckoutSession(@Body('id') itemId: string, @Req() req: Request) {
    const userId: string = req['user'].sub;

    try {
      const hostUrl = this.config.get<ServerConfig>('server').url;

      const item = await this.model3dService.getModel3d(itemId);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${hostUrl}/success.html`,
        cancel_url: `${hostUrl}/cancel.html`,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: item.name },
              unit_amount: Math.round(item.price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId,
          itemId,
        },
      });

      return { url: session.url };
      return null;
    } catch (err) {
      return err;
    }
  }

  @Public()
  @Post('webhook')
  async webhook(
    @Body() payload: any,
    @Headers('stripe-signature') sig: string,
  ) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        sig,
        this.config.get<StripeConfig>('stripe').apiKey,
      );
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        try {
          const paymentIntentSucceeded = event.data.object;

          const { userId, itemId }: { userId: string; itemId: string } =
            paymentIntentSucceeded.metadata as any;

          const insertRes = await this.model3dService.saveModel3d(
            itemId,
            userId,
          );
        } catch (err) {
          throw new InternalServerErrorException(err);
        }
        break;

      default:
        throw new BadRequestException(`Unhandled event type ${event.type}`);
    }
  }
}
