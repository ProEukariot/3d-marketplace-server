import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user';
import { File } from './file';
import { Subscribed3dModels } from './saved-models';

@Entity('models')
export class Model3d {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  price: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.models)
  user: User;

  @OneToMany(() => File, (file) => file.model3d)
  files: File[];

  @OneToMany(() => Subscribed3dModels, (savedModel)=>savedModel.model3d)
  savedModels: Subscribed3dModels[];

  // @ManyToOne(() => Model3DCategory)
  // category: Model3DCategory;
}
