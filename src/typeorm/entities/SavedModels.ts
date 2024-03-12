import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Model3d } from './Model3d';
import { User } from './User';

@Entity('savedModels')
export class SavedModel {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  model3dId: string;

  @CreateDateColumn()
  savedTime: Date;

  @ManyToOne(() => User, (user) => user.savedModels)
  user: User;

  @ManyToOne(() => Model3d, (model3d) => model3d.savedModels)
  model3d: Model3d;
}
