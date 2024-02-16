import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';
import { File } from './File';

@Entity()
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

  // @ManyToOne(() => Model3DCategory)
  // category: Model3DCategory;
}
