import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'CompareToConstraint' })
export class CompareToConstraint implements ValidatorConstraintInterface {
  constructor() {}

  validate(value: any, args: ValidationArguments) {
    const comparedValue = args.object[args.constraints[0]];

    return comparedValue == value;
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} differs from ${args.constraints[0]}!`;
  }
}
