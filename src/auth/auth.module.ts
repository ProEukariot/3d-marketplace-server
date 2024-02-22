import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { UserModule } from 'src/user/user.module';
import { UserService } from 'src/user/services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompareToConstraint } from 'src/shared/validators/compareToConstraint';
import { IsUniqueConstraint } from 'src/shared/validators/isUniqueConstraint';
import { AppValidatorsModule } from 'src/shared/validators/AppValidators.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [UserModule, AppValidatorsModule],
  exports: [AuthService],
})
export class AuthModule {}
