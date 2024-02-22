import { Module } from '@nestjs/common';
import { CompareToConstraint } from './compareToConstraint';
import { IsUniqueConstraint } from './isUniqueConstraint';

@Module({
  imports: [],
  controllers: [],
  providers: [CompareToConstraint, IsUniqueConstraint],
  exports: [CompareToConstraint, IsUniqueConstraint],
})
export class AppValidatorsModule {}
