import { ApiProperty } from '@nestjs/swagger';

export class UploadModelDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  amount: number;
}
