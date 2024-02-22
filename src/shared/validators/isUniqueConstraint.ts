import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { EntityManager } from 'typeorm';

@Injectable()
@ValidatorConstraint({ name: 'IsUniqueConstraint', async: true })
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly entityManager: EntityManager) {}

  async validate(
    value: any,
    validationArguments?: ValidationArguments,
  ): Promise<boolean> {
    const { table: tableName, column } = validationArguments.constraints[0];

    const repository = this.entityManager.getRepository(tableName);

    const recordExist = await repository
      .createQueryBuilder(tableName)
      .select() // <---
      .where({ [column]: value })
      .getExists();

    return !recordExist;
  }

  defaultMessage?(validationArguments?: ValidationArguments): string {
    return `${validationArguments.value} is already taken`;
  }
}
