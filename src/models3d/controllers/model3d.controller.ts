import {
  Body,
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { UploadModelDto } from '../dto/uploadModelDto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { FileStreamService } from 'src/shared/services/FileStreamService';
import { Repository } from 'typeorm';
import { Model3d } from 'src/typeorm/entities/Model3d';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Model3dService } from '../services/model3dService';

@Controller('models')
export class Models3dController {
  constructor(
    private readonly fs: FileStreamService,
    private readonly models3dService: Model3dService,
  ) {}

  @Post('upload')
  async uplodModel(@Body() modelDto: UploadModelDto) {
    const insertedModel3d = await this.models3dService.createModel(
      modelDto,
      '35473B73-2CCC-EE11-B4E4-4CD5770B50B8',
    );

    return insertedModel3d;
  }

  @Post('upload/files')
  @UseInterceptors(FilesInterceptor('files'))
  uplodModelFile(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100_000 }),
          new FileTypeValidator({ fileType: 'pdf' }),
        ],
      }),
    )
    files: Array<Express.Multer.File>,
  ) {
    console.log('FILEs', files);
    // this.fs.writeFile(files[0], files[0].originalname, '/uploads');

    return;
  }
}
