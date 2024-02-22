import { Module } from '@nestjs/common';
import { FileStreamService } from './FileStream.service';
import { HashService } from './hash.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FileStreamService, HashService],
  exports: [FileStreamService, HashService],
})
export class AppServicesModule {}
