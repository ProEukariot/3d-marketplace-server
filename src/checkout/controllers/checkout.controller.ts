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
import { StripeConfig } from 'interfaces/stripe-config.interface';

@Controller('checkout')
export class CheckoutController {
  constructor(
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
    private readonly config: ConfigService,
    private readonly model3dService: Model3dService,
  ) {}

  //  checkout/create-session
  @Post('create-session')
  async createCheckoutSession(@Body('id') itemId: string, @Req() req: Request) {
    console.log(req['user']);
    const userId: string = req['user'].sub;

    try {
      const clientUrl = this.config.get<ServerConfig>('server').client_url;

      const item = await this.model3dService.get3dModel(itemId);

      console.log('IDS HERE-->', itemId, userId);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${clientUrl}/explore`,
        cancel_url: `${clientUrl}/explore`,
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
        // client_reference_id
        metadata: {
          userId,
          itemId,
        },
      });

      const success = await this.stripe.checkout.sessions.retrieve(session.id);
      console.log('SUCC', success);

      return { url: session.url };
      return null;
    } catch (err) {
      return err;
    }
  }

  //  checkout/webhook
  @Public()
  @Post('webhook')
  async webhook(
    @Body() event: Stripe.Event,
    @Headers('stripe-signature') sig: string,
  ) {
    // return;
    // console.log('Payload', event);
    // console.log('stripe-signature', sig);

    // try {
    //   event = this.stripe.webhooks.constructEvent(
    //     payload,
    //     sig,
    //     this.config.get<StripeConfig>('stripe').apiKey,
    //   );
    // } catch (err) {
    //   throw new BadRequestException(`Webhook Error: ${err.message}`);
    // }

    return;
    // try {
    //   switch (event.type) {
    //     case 'charge.succeeded':
    //       const paymentIntentSucceeded = event.data.object;

    //       const { userId, itemId }: { userId: string; itemId: string } =
    //         paymentIntentSucceeded.metadata as any;

    //       console.log('META-->', paymentIntentSucceeded);

    //       const insertRes = await this.model3dService.saveModel3d(
    //         itemId,
    //         userId,
    //       );

    //       break;
    //     case 'payment_intent.succeeded':
    //       break;

    //     default:
    //       throw new BadRequestException(`Unhandled event type ${event.type}`);
    //   }
    // } catch (err) {
    //   throw new InternalServerErrorException(err);
    // }
  }
}
