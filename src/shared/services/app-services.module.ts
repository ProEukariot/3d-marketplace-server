import { Module } from '@nestjs/common';
import { FileStreamService } from './file-stream.service';
import { HashService } from './hash.service';

@Module({
  imports: [],
  controllers: [],
  providers: [FileStreamService, HashService],
  exports: [FileStreamService, HashService],
})
export class AppServicesModule {}
