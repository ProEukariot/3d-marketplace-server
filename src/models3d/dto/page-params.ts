import { Transform, Type } from 'class-transformer';
import {
  IsAlpha,
  IsAlphanumeric,
  IsBoolean,
  IsInt,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class GetModels3dParams {
  @IsString()
  @IsOptional()
  cursor?: string;

  // @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  limit: number;

  @IsString()
  @IsOptional()
  pattern?: string;

  @Min(0)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  minRange?: number;

  @Min(0)
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  maxRange?: number;
}
