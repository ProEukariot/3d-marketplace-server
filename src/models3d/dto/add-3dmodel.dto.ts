import { Transform, Type } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class Add3dModelDto {
  title: string;

  // @Transform(({ value }) => Number(value))
  @Type(() => Number)
  price: number;
}
