import { Module } from '@nestjs/common';
import { Model3dController } from './controllers/model3d.controller';
import { MulterModule } from '@nestjs/platform-express';
import { FileStreamService } from 'src/shared/services/file-stream.service';
import { AppServicesModule } from 'src/shared/services/app-services.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user';
import { Model3d } from 'src/typeorm/entities/model3d';
import { Model3dService } from './services/model3d.service';
import { File } from 'src/typeorm/entities/file';
import { Subscribed3dModels } from 'src/typeorm/entities/subscribed-models3d';

@Module({
  controllers: [Model3dController],
  providers: [Model3dService],
  imports: [AppServicesModule, TypeOrmModule.forFeature([Model3d, User, File, Subscribed3dModels])],
  exports: [Model3dService]
})
export class Models3dModule {}
