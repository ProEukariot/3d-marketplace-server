import {
  ConfigurableModuleBuilder,
  DynamicModule,
  FactoryProvider,
  Inject,
  Module,
  ModuleMetadata,
  Provider,
} from '@nestjs/common';
import { STRIPE_CLIENT } from 'src/checkout/constants';
import Stripe from 'stripe';

export type StripeOptions = { key: string; config?: Stripe.StripeConfig };
export type StripeAsyncOptions = Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider<StripeOptions>, 'useFactory' | 'inject'>;

@Module({})
export class StripeModule {
  static register(options: StripeOptions): DynamicModule {
    const stripe = new Stripe(options.key, options.config);

    const stripeProvider: Provider = {
      provide: STRIPE_CLIENT,
      useValue: stripe,
    };

    return {
      global: true,
      module: StripeModule,
      providers: [stripeProvider],
      exports: [stripeProvider],
    };
  }

  static registerAsync(options: StripeAsyncOptions): DynamicModule {
    const stripeProvider: Provider = {
      provide: STRIPE_CLIENT,
      inject: options.inject,
      useFactory: async (...args) => {
        const stripeOptions = await options.useFactory(...args);
        return new Stripe(stripeOptions.key, stripeOptions.config);
      },
    };

    return {
      module: StripeModule,
      imports: options.imports,
      providers: [stripeProvider],
      exports: [stripeProvider],
    };
  }
}
