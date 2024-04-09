import {
  BadRequestException,
  Body,
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

@Controller('models')
export class Model3dController {
  constructor(
    private readonly fs: FileStreamService,
    private readonly models3dService: Model3dService,
    private readonly configService: ConfigService,
  ) {}

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

      const insertedFiles = await Promise.all(
        Object.keys(files).map(async (key) => {
          return Promise.all(
            (files[key] as Express.Multer.File[]).map(async (file) => {
              const fileRecord = new FileEntity();
              fileRecord.size = file.size;
              fileRecord.name = file.originalname;

              fileRecord.target = key;
              fileRecord.model3d = inserted3dModel;

              return await this.models3dService.createFile(fileRecord);
            }),
          );
        }),
      );

      return { model: inserted3dModel, files: insertedFiles };
    } catch (err) {
      console.error(err);
    }

    try {
      // const AZURE_STORAGE_CONNECTION_STRING =
      //   this.configService.get<AzureConfig>('azure').connectionString;
      // console.log('Azure Conn str:', AZURE_STORAGE_CONNECTION_STRING);
      // const blobServiceClient = BlobServiceClient.fromConnectionString(
      //   AZURE_STORAGE_CONNECTION_STRING,
      // );
      // const blob = files.materials[0];
      // const blobName = blob.originalname;
      // const containerClient =
      //   blobServiceClient.getContainerClient('test-container');
      // const createContainerResponse = await containerClient.createIfNotExists();
      // console.log('Container created: ', createContainerResponse);
      // const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      // console.log('blockBlobClient', blockBlobClient);
      // console.log(
      //   `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`,
      // );
      // const uploadBlobResponse = await blockBlobClient.uploadData(blob.buffer);4
      /////////////////////------>>>>.>
      // const uploadBlobResponse = await blockBlobClient.upload(
      //   blob.buffer,
      //   blob.buffer.length,
      // );
      // console.log('Upload RESPONSE', uploadBlobResponse);
    } catch (err) {
      console.error(err);
    }

    // console.log(files);

    // const insertedModel3d = await this.models3dService.createModel3d(
    //   modelDto,
    //   userId,
    // );

    // this.models3dService.saveModel3d(insertedModel3d.id, userId);

    // return { insertedId: insertedModel3d.id };
  }

  // models/upload
  // @Post('upload')
  // async createModel3d(@Body() modelDto: UploadModel3dDto, @Req() req: Request) {
  //   const userId = req['user'].sub;

  //   const insertedModel3d = await this.models3dService.createModel3d(
  //     modelDto,
  //     userId,
  //   );

  //   this.models3dService.saveModel3d(insertedModel3d.id, userId);

  //   return { insertedId: insertedModel3d.id };
  // }

  // models/:id
  @Public()
  @Get(':id')
  async get3dModel(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.models3dService.get3dModel(id);
  }

  // models
  @Public()
  @Get()
  async get3dModels(@Query() params: PageParams) {
    return await this.models3dService.get3dModels(
      params.cursor,
      params.limit,
    );
  }

  //  models/my/:page
  // @Get('my/:page')
  // async getSavedModels3dPage(@Param() params: PageParams, @Req() req: Request) {
  //   const userId = req['user'].sub;
  //   const models = await this.models3dService.getSavedPage(userId, params.page);

  //   return models;
  // }

  // @Public()
  // @Get(':id/file')
  // async getFilebyModel3dId(@Param('id') id, @Query('ext') ext: string) {
  //   const model = await this.models3dService.getFilebyModel3dId(id, ext);

  //   return model;
  // }

  //  models/preview/:id/file
  @Public()
  @Get('preview/:id/file')
  async getModel3dFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
    @Query('ext') ext: string,
  ) {
    const model3d = await this.models3dService.get3dModel(id);

    const user = model3d.user;
    const userId = user.id;

    const fileMeta = await this.models3dService.getFileByModel3d(id, ext);

    const fileName = `${fileMeta.id}.${fileMeta.name}`;
    const fileDir = `../uploads/user-${userId}`;

    const file = this.fs.getReadStream(fileName, fileDir);
    res.set({
      'Content-Type': 'application/octet-stream',
    });

    return new StreamableFile(file);
  }

  //  models/:id/files
  @Public()
  @Get(':id/files')
  async getFilesMetaForModel3d(@Param('id', new ParseUUIDPipe()) id: string) {
    const filesMeta = await this.models3dService.getFilesByModel3d(id);

    console.log(filesMeta);

    return filesMeta;
  }

  //  models/download/:id/file-meta/:ext
  @Get('download/:id/file-meta/:ext')
  async downloadModel3dMeta(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('ext') ext: string,
  ) {
    const file = await this.models3dService.getFileByModel3d(id, ext);

    return file;
  }

  //  models/download/:id/file/:ext
  @Get('download/:id/file/:ext')
  async downloadModel3dFile(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('ext') ext: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;

    const hasEntry = await this.models3dService.userSavedModel3d(userId, id);

    if (!hasEntry) throw new BadRequestException('The model is not saved!');

    const model3d = await this.models3dService.get3dModel(id);
    if (!model3d) return new NotFoundException('File not found');

    const creator = model3d.user;
    const creatorId = creator.id;

    const fileMeta = await this.models3dService.getFileByModel3d(id, ext);
    if (!fileMeta) return new NotFoundException('File not found');

    const fileName = `${fileMeta.id}.${fileMeta.name}`;
    const fileDir = `../uploads/user-${creatorId}`;
    const fileExt = fileMeta.name;
    const model3dName = model3d.name;

    const file = this.fs.getReadStream(fileName, fileDir);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${model3dName}.${fileExt}"`,
    });

    return new StreamableFile(file);
  }

  //  models/save
  @Post('save')
  async saveModel3d(
    @User() user: UserEntity,
    @Body() modelDto: SaveModel3dDto,
  ) {
    modelDto.id;

    const model3d = new Model3dEntity();
    model3d.id = modelDto.id;

    try {
      return await this.models3dService.subscribe3dModelToUser(model3d, user);
    } catch (error) {
      if (error.number == 2627) {
        return new BadRequestException(
          'The 3D model is already saved for that user',
        );
      }

      return new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
