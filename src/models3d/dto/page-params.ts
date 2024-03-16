import { Transform } from 'class-transformer';
import {
  IsAlpha,
  IsInt,
  IsNumber,
  IsNumberString,
  IsPositive,
  Min,
} from 'class-validator';

export class PageParams {
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  page: number;
}
