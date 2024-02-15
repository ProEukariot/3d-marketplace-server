import { Module } from '@nestjs/common';
import { Models3dController } from './controllers/models3d.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FileStreamService } from 'src/shared/services/FileStreamService';
import { AppServicesModule } from 'src/shared/services/AppServices.module';

@Module({
  controllers: [Models3dController],
  imports: [AppServicesModule],
})
export class Models3dModule {}
