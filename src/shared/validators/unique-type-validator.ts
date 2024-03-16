import {
  ValidationArguments,
  ValidatorConstraintInterface,
} from 'class-validator';

export class UniqueTypeValidator implements ValidatorConstraintInterface {
  constructor() {}

  validate(
    value: Array<Express.Multer.File>,
    validationArguments?: ValidationArguments,
  ): boolean | Promise<boolean> {
    let extRecords: Record<string, any> = {};

    for (let file of value) {
      const ext = file.originalname.split('.').pop();

      if (extRecords[ext]) {
        return false;
      }

      extRecords[ext] = true;
    }

    return true;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return 'Repeated extensions are not allowed';
  }
}
