import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Ip,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Public } from 'src/utils/skip-auth';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from '../constants';
import { ServerConfig } from 'interfaces/server-config.interface';
import { Model3dService } from 'src/models3d/services/model3d.service';
import { StripeConfig } from 'interfaces/stripe-config.interface';
import { User } from 'src/shared/decorators/get-user.decorator';
import { User as UserEntity } from 'src/typeorm/entities/user';
import { Model3d as Model3dEntity } from 'src/typeorm/entities/model3d';
import { CreateSessionDto } from '../dto/create-session.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(
    @Inject(STRIPE_CLIENT) private stripe: Stripe,
    private readonly config: ConfigService,
    private readonly model3dService: Model3dService,
  ) {}

  // checkout/create-session
  @Post('create-session')
  async createCheckoutSession(
    @Body() body: CreateSessionDto,
    @User() user: UserEntity,
  ) {
    try {
      const clientUrl = this.config.get<ServerConfig>('server').client_url;

      let model = new Model3dEntity();
      model.id = body.id;

      // Validate whether the user already owns that 3D model
      const sub = await this.model3dService.getSubscribed3dModel(user, model);

      if (sub) return new BadRequestException('The model is already owned.');

      model = await this.model3dService.get3dModel(body.id);

      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${clientUrl}/explore/${model.id}`,
        cancel_url: `${clientUrl}/explore/${model.id}`,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: { name: model.name },
              unit_amount: Math.round(model.price * 100),
            },
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          itemId: body.id,
        },
        customer_email: user.email,
      });

      return { url: session.url };
    } catch (err) {
      return err;
    }
  }

  // checkout/webhook
  @Public()
  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Ip() ip: string) {
    let event!: Stripe.Event;

    // validate request comes from stripe
    if (!this.config.get<StripeConfig>('stripe').webhookIps.includes(ip))
      throw new UnauthorizedException();

    // Validate event
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody,
        req.headers['stripe-signature'],
        this.config.get<StripeConfig>('stripe').webhookKey,
      );
    } catch (error) {
      throw new UnauthorizedException();
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const { userId, itemId } = event.data.object['metadata'] as {
          itemId: string;
          userId: string;
        };

        try {
          const user = new UserEntity();
          user.id = userId;

          const model = new Model3dEntity();
          model.id = itemId;

          await this.model3dService.subscribe3dModelToUser(model, user);

          break;
        } catch (error) {
          // refund if subscribing 3d model to user fails
          const paymentIntentId = event.data.object['payment_intent'];

          const refund = await this.stripe.refunds.create({
            payment_intent: paymentIntentId as string,
          });

          throw error;
        }

      case 'charge.succeeded':
        // send receipt here or configure it in stripe
        const receiptUrl = event.data.object['receipt_url'];

        break;

      default:
        // Unhandled stripe events default logic
        break;
    }

    return;
  }
}
