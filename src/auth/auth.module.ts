import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompareToConstraint } from 'src/shared/validators/compareToConstraint';
import { IsUniqueConstraint } from 'src/shared/validators/isUniqueConstraint';
import { AppValidatorsModule } from 'src/shared/validators/AppValidators.module';
import { HashService } from 'src/shared/services/hash.service';
import { AppServicesModule } from 'src/shared/services/AppServices.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    UserModule,
    AppValidatorsModule,
    AppServicesModule,
    JwtModule.register({
      global: true,
      secret: 'SECRET',
      signOptions: { expiresIn: '180s' },
    }),
  ],
  exports: [AuthService],
})
export class AuthModule {}
