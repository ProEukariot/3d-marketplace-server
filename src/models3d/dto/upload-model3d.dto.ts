import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches, Max, Min } from 'class-validator';

export class UploadModel3dDto {
  // @ApiProperty()
  @IsNotEmpty()
  @Matches('^[A-Za-z0-9-_]*$')
  name: string;

  // @ApiProperty()
  @IsNotEmpty()
  @Min(0)
  @Max(99999)
  amount: number;
}
