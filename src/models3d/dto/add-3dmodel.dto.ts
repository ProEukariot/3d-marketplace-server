import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class Add3dModelDto {
  title: string;

  @Transform(({ value }) => Number(value))
  price: number;
}
