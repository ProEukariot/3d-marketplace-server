import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Models3dModule } from './models3d/models3d.module';
import { FileStreamService } from './shared/services/FileStreamService';

@Module({
  imports: [Models3dModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [],
})
export class AppModule {}
