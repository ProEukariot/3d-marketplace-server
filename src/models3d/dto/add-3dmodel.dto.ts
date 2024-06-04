import { Transform, Type } from 'class-transformer';
import {
  IsAlphanumeric,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class Add3dModelDto {
  @IsString()
  title: string;

  // @Transform(({ value }) => Number(value))
  @Type(() => Number)
  @Min(0)
  @Max(100_000)
  price: number;
}
