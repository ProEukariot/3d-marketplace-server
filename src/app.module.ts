import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Models3dModule } from './models3d/model3d.module';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AuthGuard } from './shared/guards/auth.guard';
import { CheckoutModule } from './checkout/checkout.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import typeormConfig from 'config/typeorm.config';
import jwtConfig from 'config/jwt.config';

@Module({
  imports: [
    Models3dModule,
    AuthModule,
    UserModule,
    CheckoutModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.get<TypeOrmModuleOptions>('typeorm'),
    }),
    ConfigModule.forRoot({ isGlobal: true, load: [typeormConfig, jwtConfig] }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
  exports: [],
})
export class AppModule {}
