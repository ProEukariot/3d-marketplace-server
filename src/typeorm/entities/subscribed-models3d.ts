import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Model3d } from './model3d';
import { User } from './user';

@Entity('subscribed3dModels')
export class Subscribed3dModels {
  @PrimaryColumn()
  userId: string;

  @PrimaryColumn()
  model3dId: string;

  @CreateDateColumn()
  savedTime: Date;

  @ManyToOne(() => User, (user) => user.savedModels)
  user: User;

  // @OneToOne(() => Model3d)
  // @JoinColumn()
  @ManyToOne(() => Model3d, (model3d) => model3d.savedModels)
  model3d: Model3d;
}
