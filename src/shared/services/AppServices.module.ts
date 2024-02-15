import { Module } from '@nestjs/common';
import { FileStreamService } from './FileStreamService';

@Module({
  imports: [],
  controllers: [],
  providers: [FileStreamService],
  exports: [FileStreamService],
})
export class AppServicesModule {}
