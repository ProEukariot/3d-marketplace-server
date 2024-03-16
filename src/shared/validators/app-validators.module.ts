import { Module } from '@nestjs/common';
import { CompareToConstraint } from './compare-to-constraint';
import { IsUniqueConstraint } from './is-unique-constraint';

@Module({
  imports: [],
  controllers: [],
  providers: [CompareToConstraint, IsUniqueConstraint],
  exports: [CompareToConstraint, IsUniqueConstraint],
})
export class AppValidatorsModule {}
