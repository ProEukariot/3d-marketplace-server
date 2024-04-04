import {
  ValidationOptions,
  registerDecorator,
  ValidationDecoratorOptions,
} from 'class-validator';
import { IsUniqueConstraint } from './is-unique-constraint';

export type isUniqueOptions = {
  table: string;
  column: string;
};

export function isUnique(
  options: isUniqueOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propName: string) {
    const validationDecoratorOptions: ValidationDecoratorOptions = {
      name: 'isUnique',
      target: object.constructor,
      propertyName: propName,
      options: validationOptions,
      constraints: [options],
      validator: IsUniqueConstraint,
    };

    registerDecorator(validationDecoratorOptions);
  };
}
