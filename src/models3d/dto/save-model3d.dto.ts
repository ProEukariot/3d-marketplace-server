import { IsUUID } from 'class-validator';

export class SaveModel3dDto {
  @IsUUID()
  id: string;
}
