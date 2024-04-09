import { Transform, Type } from 'class-transformer';
import {
  IsAlpha,
  IsInt,
  IsNumber,
  IsNumberString,
  IsPositive,
  Min,
} from 'class-validator';

export class PageParams {
  cursor?: string;

  // @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit: number;
}
