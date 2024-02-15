import { Module } from '@nestjs/common';
import { Models3dController } from './controllers/model3d.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FileStreamService } from 'src/shared/services/FileStreamService';
import { AppServicesModule } from 'src/shared/services/AppServices.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Model3d } from 'src/typeorm/entities/Model3d';
import { Model3dService } from './services/model3dService';

@Module({
  controllers: [Models3dController],
  providers: [Model3dService],
  imports: [AppServicesModule, TypeOrmModule.forFeature([Model3d, User])],
})
export class Models3dModule {}
