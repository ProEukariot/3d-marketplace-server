import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
  } from 'class-validator';
  import { CompareToConstraint } from './compareToConstraint';
  
  export function CompareTo(
    propName: string,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: Object, propertyName: string) {
      registerDecorator({
        name: 'compareTo',
        target: object.constructor,
        propertyName: propertyName,
        constraints: [propName],
        options: validationOptions,
        validator: CompareToConstraint,
      });
    };
  }