import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

export type FileTypeValidatorOptions = {
  types: string[];
};

export class FileTypeValidator implements ValidatorConstraintInterface {
  constructor(private options?: FileTypeValidatorOptions) {}

  validate(
    value: Array<Express.Multer.File>,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    if (!this.options) return true;

    for (let file of value) {
      const ext = file.originalname.split('.').pop();

      if (!this.options.types.includes(ext)) {
        return false;
      }
    }

    return true;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return 'File types are not accepted';
  }
}
