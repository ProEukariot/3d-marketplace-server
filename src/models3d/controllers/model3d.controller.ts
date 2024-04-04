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
import { Model3d } from 'src/typeorm/entities/model3d';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user';
import { Model3dService } from '../services/model3d.service';
import { FileMeta } from '../types/file-meta';
import { FileValidationPipe } from 'src/shared/pipes/file-validation-pipe';
import { FileTypeValidator } from 'src/shared/validators/file-type-validator';
import { UniqueTypeValidator } from 'src/shared/validators/unique-type-validator';
import { UploadModel3dFilesDto } from '../dto/upload-model3d-files.dto';
import { Public } from 'src/utils/skip-auth';
import { PageParams } from '../dto/page-params';
import { SaveModel3dDto } from '../dto/save-model3d.dto';
import { Add3dModelDto } from '../dto/add-3dmodel.dto';

@Controller('models')
export class Model3dController {
  constructor(
    private readonly fs: FileStreamService,
    private readonly models3dService: Model3dService,
  ) {}

  @Post('add')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'materials' }, { name: 'models' }]),
  )
  async add3dModel(
    @Body() modelDto: Add3dModelDto,
    @Req() req: Request,
    @UploadedFiles()
    files: {
      materials: Express.Multer.File[];
      models: Express.Multer.File[];
    },
  ) {
    console.log(JSON.stringify(modelDto));

    const userId = req['user'].sub;

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

  // models/:id/details
  @Public()
  @Get(':id/details')
  async getModel3d(@Param('id', new ParseUUIDPipe()) id: string) {
    const model = await this.models3dService.getModel3d(id);
    return model;
  }

  //  models/upload/files
  @Post('upload/files')
  @UseInterceptors(FilesInterceptor('files'))
  async uplodModel3dFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10_000_000 }),
          // new FileTypeValidator({ fileType: 'pdf,txt' }),
        ],
      }),
      new FileValidationPipe({
        validators: [
          new FileTypeValidator({ types: ['glb'] }),
          new UniqueTypeValidator(),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() modelFilesDto: UploadModel3dFilesDto,
    @Req() req: Request,
  ) {
    const userId = req['user'].sub;

    const tasks = files.map(async (file) => {
      const ext = file.originalname.split('.').pop();
      const size = file.size;

      const fileMeta: FileMeta = { size, ext };

      const createdFile = await this.models3dService.createFile(
        fileMeta,
        modelFilesDto.model3dId,
      );

      file.originalname = `${createdFile.id}.${ext}`;

      const userDir = `../uploads/user-${userId}`;

      this.fs.createDirectory(userDir);

      const ws = this.fs.getWriteStream(file.originalname, userDir);
      ws.write(file.buffer);
      ws.end();

      return createdFile;
    });

    const insertedFiles = await Promise.all(tasks);

    const ids = insertedFiles.map((file) => file.id);

    return { insertedIds: ids };
  }

  //  models/:page
  @Public()
  @Get(':page')
  async getModels3dPage(@Param() params: PageParams) {
    const models = await this.models3dService.getPage(params.page);

    return models;
  }

  //  models/my/:page
  @Get('my/:page')
  async getSavedModels3dPage(@Param() params: PageParams, @Req() req: Request) {
    const userId = req['user'].sub;
    const models = await this.models3dService.getSavedPage(userId, params.page);

    return models;
  }

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
    const model3d = await this.models3dService.getModel3d(id);

    const user = model3d.user;
    const userId = user.id;

    const fileMeta = await this.models3dService.getFileByModel3d(id, ext);

    const fileName = `${fileMeta.id}.${fileMeta.ext}`;
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

    const model3d = await this.models3dService.getModel3d(id);
    if (!model3d) return new NotFoundException('File not found');

    const creator = model3d.user;
    const creatorId = creator.id;

    const fileMeta = await this.models3dService.getFileByModel3d(id, ext);
    if (!fileMeta) return new NotFoundException('File not found');

    const fileName = `${fileMeta.id}.${fileMeta.ext}`;
    const fileDir = `../uploads/user-${creatorId}`;
    const fileExt = fileMeta.ext;
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
  async saveModel3d(@Body() modelDto: SaveModel3dDto, @Req() req: Request) {
    const userId = req['user'].sub;

    try {
      const insertedResult = await this.models3dService.saveModel3d(
        modelDto.id,
        userId,
      );

      return insertedResult;
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
