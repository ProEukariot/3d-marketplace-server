import { IsNotEmpty, IsUUID } from 'class-validator';

export class UploadModel3dFilesDto {
//   @IsNotEmpty()
  @IsUUID()
  model3dId: string;
}
