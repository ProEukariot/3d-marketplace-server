import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from 'src/user/user.module';
import { AppValidatorsModule } from 'src/shared/validators/app-validators.module';
import { AppServicesModule } from 'src/shared/services/app-services.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UserModule,
    AppValidatorsModule,
    AppServicesModule,
    // JwtModule.register({
    //   global: true,
    //   secret: 'SECRET',
    //   signOptions: { expiresIn: '3600s' },
    // })
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('jwt'),
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
