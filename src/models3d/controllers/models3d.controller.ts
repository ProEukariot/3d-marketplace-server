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
import { diskStorage } from 'multer';
import { FileStreamService } from 'src/shared/services/FileStreamService';

@Controller('models')
export class Models3dController {
  constructor(private readonly fs: FileStreamService) {}

  @Post('upload')
  uplodModel(@Body() modelDto: UploadModelDto) {
    console.log('FILEs', modelDto);

    return;
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
