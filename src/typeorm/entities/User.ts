import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Model3d } from './model3d';
import { SavedModel } from './saved-models';

@Entity('users')
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

  // @ManyToMany(() => Model3d)
  // @JoinTable({name: "saved_models"})
  // savedModels: Model3d[];

  @OneToMany(() => SavedModel, (savedModel)=>savedModel.user)
  savedModels: SavedModel[];
}
