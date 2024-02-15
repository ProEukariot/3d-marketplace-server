import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Model3d } from './Model3d';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ nullable: false })
  hash: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Model3d, (model3d) => model3d.user)
  models: Model3d[];
}
