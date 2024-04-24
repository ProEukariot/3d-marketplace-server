import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  // FileTypeValidator,
  Get,
  InternalServerErrorException,
  MaxFileSizeValidator,
  NotFoundException,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UploadModel3dDto } from '../dto/upload-model3d.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { FileStreamService } from 'src/shared/services/file-stream.service';
import { QueryFailedError, Repository } from 'typeorm';
import { Model3d as Model3dEntity } from 'src/typeorm/entities/model3d';
import { File as FileEntity } from 'src/typeorm/entities/file';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserEntity } from 'src/typeorm/entities/user';
import { Model3dService } from '../services/model3d.service';
import { File } from '../types/file';
import { FileValidationPipe } from 'src/shared/pipes/file-validation-pipe';
import { FileTypeValidator } from 'src/shared/validators/file-type-validator';
import { UniqueTypeValidator } from 'src/shared/validators/unique-type-validator';
import { UploadModel3dFilesDto } from '../dto/upload-model3d-files.dto';
import { Public } from 'src/utils/skip-auth';
import { PageParams } from '../dto/page-params';
import { SaveModel3dDto } from '../dto/save-model3d.dto';
import { Add3dModelDto } from '../dto/add-3dmodel.dto';
import { BlobServiceClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { AzureConfig } from 'interfaces/azure-config.interface';
import { User } from 'src/shared/decorators/get-user.decorator';
import { v4 as uuidv4 } from 'uuid';
import { BlobStorageService } from 'src/azure/services/azure.service';

@Controller('models')
export class Model3dController {
  constructor(
    private readonly fs: FileStreamService,
    private readonly models3dService: Model3dService,
    private readonly configService: ConfigService,
    private readonly blobService: BlobStorageService,
  ) {}

  private async insertFile(
    file: Express.Multer.File,
    related3dModelEntity: Model3dEntity,
    targetDirectory: string,
    access: 'public' | 'private' = 'private',
  ) {
    try {
      const fileEntity = new FileEntity();
      fileEntity.size = file.size;
      fileEntity.name = file.originalname;

      fileEntity.access = access;
      fileEntity.target = targetDirectory;
      fileEntity.model3d = related3dModelEntity;

      const insertedFile = await this.models3dService.createFile(fileEntity);
      return insertedFile;
    } catch (err) {
      throw err;
    }
  }

  private async uploadBlob(
    fileEntity: FileEntity,
    user: UserEntity,
    blob: Express.Multer.File,
  ) {
    try {
      const containerName = `usr-${user.id}`.toLowerCase();

      // fileEntity must be with model3dEntity relation
      const blobName =
        `${fileEntity.model3d.id}/${fileEntity.access}/${fileEntity.target}/blob-${fileEntity.id}`.toLowerCase();

      const uploadRes = await this.blobService.uploadBlob(
        containerName,
        blobName,
        blob,
      );

      return uploadRes;
    } catch (err) {
      throw err;
    }
  }

  // models/add
  @Post('add')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'materials' }, { name: 'models' }]),
  )
  async add3dModel(
    @User() user: UserEntity,
    @Body() modelDto: Add3dModelDto,
    @UploadedFiles()
    files: {
      materials: Express.Multer.File[];
      models: Express.Multer.File[];
    },
  ) {
    try {
      const model3d = new Model3dEntity();
      model3d.name = modelDto.title;
      model3d.price = modelDto.price;
      model3d.user = user;

      const inserted3dModel = await this.models3dService.create3dModel(model3d);

      await this.models3dService.subscribe3dModelToUser(inserted3dModel, user);

      // save preview file (modify file data here)

      const savePreviewFiles = async () => {
        const fileToSave = files.models[0];
        const insertedFile = await this.insertFile(
          fileToSave,
          inserted3dModel,
          'models',
          'public',
        );
        const uploadBlobResponse = await this.uploadBlob(
          insertedFile,
          user,
          fileToSave,
        );

        return { insertedFile, uploadBlobResponse };
      };

      // save source files
      const saveSourceFiles = async () => {
        return Promise.all(
          Object.keys(files).map(async (key) => {
            return Promise.all(
              (files[key] as Express.Multer.File[]).map(async (file) => {
                const insertedFile = await this.insertFile(
                  file,
                  inserted3dModel,
                  key,
                );

                const uploadBlobResponse = await this.uploadBlob(
                  insertedFile,
                  user,
                  file,
                );

                return { insertedFile, uploadBlobResponse };
              }),
            );
          }),
        );
      };

      const res = await Promise.all([savePreviewFiles(), saveSourceFiles()]);

      return { model: inserted3dModel };
    } catch (err) {
      console.error(err);
    }
  }

  // models
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async get3dModels(@Query() params: PageParams) {
    try {
      return await this.models3dService.get3dModels(
        params.limit,
        params.cursor,
      );
    } catch (error) {
      throw error;
    }
  }

  // models/subscribed-models
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('subscribed-models')
  async getSubscribed3dModels(
    @User() user: UserEntity,
    @Query() params: PageParams,
  ) {
    try {
      return await this.models3dService.getSubscribed3dModels(
        user,
        params.limit,
        params.cursor,
      );
    } catch (error) {
      throw error;
    }
  }

  // models/:id
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async get3dModel(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      return await this.models3dService.get3dModel(id, {
        user: true,
        files: true,
      });
    } catch (error) {
      throw error;
    }
  }

  //  models/download/:id/file/:ext
  // @Get('download/:id/file/:ext')
  // async downloadModel3dFile(
  //   @Param('id', new ParseUUIDPipe()) id: string,
  //   @Param('ext') ext: string,
  //   @Res({ passthrough: true }) res: Response,
  //   @Req() req: Request,
  // ) {
  //   const userId = req['user'].sub;

  //   const hasEntry = await this.models3dService.userSavedModel3d(userId, id);

  //   if (!hasEntry) throw new BadRequestException('The model is not saved!');

  //   const model3d = await this.models3dService.get3dModel(id);
  //   if (!model3d) return new NotFoundException('File not found');

  //   const creator = model3d.user;
  //   const creatorId = creator.id;

  //   const fileMeta = await this.models3dService.getFileByModel3d(id, ext);
  //   if (!fileMeta) return new NotFoundException('File not found');

  //   const fileName = `${fileMeta.id}.${fileMeta.name}`;
  //   const fileDir = `../uploads/user-${creatorId}`;
  //   const fileExt = fileMeta.name;
  //   const model3dName = model3d.name;

  //   const file = this.fs.getReadStream(fileName, fileDir);
  //   res.set({
  //     'Content-Type': 'application/octet-stream',
  //     'Content-Disposition': `attachment; filename="${model3dName}.${fileExt}"`,
  //   });

  //   return new StreamableFile(file);
  // }

  //  models/save
  // @Post('save')
  // async saveModel3d(
  //   @User() user: UserEntity,
  //   @Body() modelDto: SaveModel3dDto,
  // ) {
  //   modelDto.id;

  //   const model3d = new Model3dEntity();
  //   model3d.id = modelDto.id;

  //   try {
  //     return await this.models3dService.subscribe3dModelToUser(model3d, user);
  //   } catch (error) {
  //     if (error.number == 2627) {
  //       return new BadRequestException(
  //         'The 3D model is already saved for that user',
  //       );
  //     }

  //     return new InternalServerErrorException('An unexpected error occurred');
  //   }
  // }
}
