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
import { GetModels3dParams as Get3dModelsParams } from '../dto/page-params';
import { SaveModel3dDto } from '../dto/save-model3d.dto';
import { Add3dModelDto } from '../dto/add-3dmodel.dto';
import {
  BlobServiceClient,
  ContainerSASPermissions,
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { AzureConfig } from 'interfaces/azure-config.interface';
import { User } from 'src/shared/decorators/get-user.decorator';
import { v4 as uuidv4 } from 'uuid';
import { BlobStorageService } from 'src/azure/services/azure.service';
import { NotFoundError } from 'rxjs';

@Controller('models')
export class Model3dController {
  private readonly blobPrefixes = { container: 'usr-', blob: 'blob-' };

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
      const containerName =
        `${this.blobPrefixes.container}${user.id}`.toLowerCase();

      // fileEntity must be with model3dEntity relation
      const blobName =
        `${fileEntity.model3d.id}/${fileEntity.access}/${fileEntity.target}/${this.blobPrefixes.blob}${fileEntity.id}`.toLowerCase();

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

  private saveFilesAndBlobs = async (
    files: Express.Multer.File[],
    relatedUser: UserEntity,
    related3dModel: Model3dEntity,
    targetDirectory: string,
    access: 'public' | 'private' = 'private',
    options?: { singleFile?: boolean },
  ) => {
    if (options && options.singleFile) files = new Array(files[0]);

    return Promise.all(
      files.map(async (file) => {
        const insertedFile = await this.insertFile(
          file,
          related3dModel,
          targetDirectory,
          access,
        );

        const uploadBlobResponse = await this.uploadBlob(
          insertedFile,
          relatedUser,
          file,
        );

        return { insertedFile, uploadBlobResponse };
      }),
    );
  };

  // models/add
  @Post('add')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images' }, { name: 'models' }]),
  )
  async add3dModel(
    @User() user: UserEntity,
    @Body() modelDto: Add3dModelDto,
    @UploadedFiles()
    files: {
      images: Express.Multer.File[];
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

      // files.models should be replaced with derived damaged file
      const previewFilesPromise = this.saveFilesAndBlobs(
        files.models,
        user,
        inserted3dModel,
        'models',
        'public',
        { singleFile: true },
      );

      const sourceFilesPromise = this.saveFilesAndBlobs(
        files.models,
        user,
        inserted3dModel,
        'models',
      );

      const previewImagePromise = this.saveFilesAndBlobs(
        files.images,
        user,
        inserted3dModel,
        'images',
        'public',
        { singleFile: true },
      );

      const res = await Promise.all([
        previewFilesPromise,
        sourceFilesPromise,
        previewImagePromise,
      ]);

      return { model: inserted3dModel };
    } catch (err) {
      console.error(err);
    }
  }

  // models
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async get3dModels(@Query() params: Get3dModelsParams) {
    const pagination = { limit: params.limit, cursor: params.cursor };
    const filtering = {
      pattern: params.pattern,
      minRange: params.minRange,
      maxRange: params.maxRange,
    };

    try {
      return await this.models3dService.get3dModels(pagination, filtering);
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Get('preview/:id')
  async getPublicModelBlobUrl(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query('target') target: string = 'models',
  ) {
    const file = await this.models3dService.getPublicFileBy3dModel(id, target);

    const containerName =
      `${this.blobPrefixes.container}${file.model3d.user.id}`.toLowerCase();
    const blobName =
      `${file.model3d.id}/${file.access}/${file.target}/${this.blobPrefixes.blob}${file.id}`.toLowerCase();

    let date = new Date();

    const url = await this.blobService.getBlobSasUrl(containerName, blobName, {
      permissions: ContainerSASPermissions.parse('r'),
      expiresOn: new Date(date.setDate(date.getDate() + 1)),
    });

    return url;
  }

  //
  @Get(':id/blob/:blobId')
  async getPrivateModelBlobUrl(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('blobId', new ParseUUIDPipe()) blobId: string,
    @User() user: UserEntity,
  ) {
    const requestedModel = new Model3dEntity();
    requestedModel.id = id;

    const model = await this.models3dService.get3dModel(requestedModel.id, {
      user: true,
    });

    if (!model) throw new NotFoundException();

    const subModel = await this.models3dService.getSubscribed3dModel(
      user,
      requestedModel,
      ['user', 'model3d', 'model3d.files'],
    );

    if (!subModel) return null;

    const file = subModel.model3d.files.filter((f) => f.id == blobId)[0];

    if (!file) throw new NotFoundException();

    const containerName =
      `${this.blobPrefixes.container}${model.user.id}`.toLowerCase();
    const blobName =
      `${subModel.model3d.id}/${file.access}/${file.target}/${this.blobPrefixes.blob}${file.id}`.toLowerCase();

    let date = new Date();
    const urlPromise = this.blobService.getBlobSasUrl(containerName, blobName, {
      permissions: ContainerSASPermissions.parse('r'),
      expiresOn: new Date(date.setDate(date.getDate() + 1)),
    });

    const incrementPromise = this.models3dService.incrementDownloads(model);

    const [url, _] = await Promise.all([urlPromise, incrementPromise]);

    return url;
  }

  // models/subscribed-models
  @UseInterceptors(ClassSerializerInterceptor)
  @Get('subscribed-models')
  async getSubscribed3dModels(
    @User() user: UserEntity,
    @Query() params: Get3dModelsParams,
  ) {
    const pagination = { limit: params.limit, cursor: params.cursor };
    const filtering = {
      pattern: params.pattern,
      minRange: params.minRange,
      maxRange: params.maxRange,
    };

    try {
      return await this.models3dService.getSubscribed3dModels(
        user,
        pagination,
        filtering,
      );
    } catch (error) {
      throw error;
    }
  }

  @Public()
  @Get('price-range')
  async getModelsPriceRange() {
    try {
      return await this.models3dService.getPriceRange();
    } catch (err) {
      throw err;
    }
  }

  // models/:id
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  async get3dModel(@Param('id', new ParseUUIDPipe()) id: string) {
    try {
      const model = await this.models3dService.get3dModel(id, {
        user: true,
        files: true,
      });

      return model;
    } catch (error) {
      throw error;
    }
  }
}
