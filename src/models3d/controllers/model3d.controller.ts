import {
  Body,
  Controller,
  // FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { Response } from 'express';
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

@Controller('models')
export class Models3dController {
  constructor(
    private readonly fs: FileStreamService,
    private readonly models3dService: Model3dService,
  ) {}

  USER_ID = '35473B73-2CCC-EE11-B4E4-4CD5770B50B8'; // from token

  @Post('upload')
  async createModel3d(@Body() modelDto: UploadModel3dDto) {
    const insertedModel3d = await this.models3dService.createModel3d(
      modelDto,
      this.USER_ID,
    );

    return { insertedId: insertedModel3d.id };
  }

  @Post('upload/files')
  @UseInterceptors(FilesInterceptor('files'))
  async uplodModel3dFiles(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100_000 }),
          // new FileTypeValidator({ fileType: 'pdf,txt' }),
        ],
      }),
      new FileValidationPipe({
        validators: [
          new FileTypeValidator({ types: ['pdf', 'jpg'] }),
          new UniqueTypeValidator(),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
    @Body() modelFilesDto: UploadModel3dFilesDto,
  ) {
    const tasks = files.map(async (file) => {
      const ext = file.originalname.split('.').pop();
      const size = file.size;

      const fileMeta: FileMeta = { size, ext };

      const createdFile = await this.models3dService.createFile(
        fileMeta,
        modelFilesDto.model3dId,
      );

      file.originalname = `${createdFile.id}.${ext}`;

      const userDir = `/uploads/user-${this.USER_ID}`;

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

  @Get('download/files/:id')
  async downloadModel3dFiles(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const fileMeta = await this.models3dService.getFile(id);

    const fileName = `${fileMeta.id}.${fileMeta.ext}`;
    const fileDir = `uploads/user-${this.USER_ID}`;
    const ext = fileMeta.ext;
    const model3dName = fileMeta.model3d.name;

    const file = this.fs.getReadStream(fileName, fileDir);
    res.set({
      'Content-Disposition': `attachment; filename="${model3dName}.${ext}"`,
    });

    return new StreamableFile(file);
  }
}
