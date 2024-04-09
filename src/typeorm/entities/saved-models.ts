import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Model3d } from './model3d';
import { User } from './user';

@Entity('savedModels')
export class Subscribed3dModels {
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
