import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';
import { FileTypeValidator } from '../validators/FileTypeValidator';
import { ValidatorConstraintInterface } from 'class-validator';

export type FileValidationOptions = {
  validators?: ValidatorConstraintInterface[];
};

type Error = { message: string } | null;

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private options: FileValidationOptions) {}

  transform(value: Array<Express.Multer.File>, metadata: ArgumentMetadata) {
    const error = this.getError(value);
    
    if (error) throw new BadRequestException(error.message);

    return value;
  }

  private getError(files: Array<Express.Multer.File>): Error {
    if (this.options.validators) {
      for (let validator of this.options.validators) {
        if (!validator.validate(files)) {
          return { message: validator.defaultMessage() };
        }
      }
    }

    return null;
  }
}
