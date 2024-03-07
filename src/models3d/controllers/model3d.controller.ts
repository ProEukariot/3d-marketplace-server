import {
  Body,
  Controller,
  // FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { UploadModel3dDto } from '../dto/uploadModel3dDto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileStreamService } from 'src/shared/services/FileStream.service';
import { Repository } from 'typeorm';
import { Model3d } from 'src/typeorm/entities/Model3d';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Model3dService } from '../services/model3d.service';
import { FileMeta } from '../types/FileMeta';
import { FileValidationPipe } from 'src/shared/pipes/FileValidationPipe';
import { FileTypeValidator } from 'src/shared/validators/FileTypeValidator';
import { UniqueTypeValidator } from 'src/shared/validators/UniqueTypeValidator';
import { UploadModel3dFilesDto } from '../dto/uploadModel3dFilesDto';
import { Public } from 'src/utils/skipAuth';
import { PageParams } from '../dto/pageParams';

@Controller('models')
export class Models3dController {
  constructor(
    private readonly fs: FileStreamService,
    private readonly models3dService: Model3dService,
  ) {}

  @Public()
  @Get('list')
  getModels3d() {}

  @Post('upload')
  async createModel3d(@Body() modelDto: UploadModel3dDto, @Req() req: Request) {
    const userId = req['user'].sub;

    const insertedModel3d = await this.models3dService.createModel3d(
      modelDto,
      userId,
    );

    return { insertedId: insertedModel3d.id };
  }

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

      const userDir = `/uploads/user-${userId}`;

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

  @Public()
  @Get('download/files/:id')
  async downloadModel3dFiles(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.models3dService.getUserByFileId(id);
    const userId = user.id;

    const fileMeta = await this.models3dService.getFile(id);

    const fileName = `${fileMeta.id}.${fileMeta.ext}`;
    const fileDir = `uploads/user-${userId}`;
    const ext = fileMeta.ext;
    const model3dName = fileMeta.model3d.name;

    const file = this.fs.getReadStream(fileName, fileDir);
    res.set({
      'Content-Type': 'model/gltf-binary',
      'Content-Disposition': `attachment; filename="${model3dName}.${ext}"`,
    });

    return new StreamableFile(file);
  }

  @Public()
  @Get(':page')
  async getModels3dPage(@Param() params: PageParams) {
    console.log(params.page);
    
    const models = await this.models3dService.getPage(params.page);

    return models;
  }
}
