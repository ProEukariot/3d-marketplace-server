import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './User';

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
  
    // @ManyToOne(() => Model3DCategory)
    // category: Model3DCategory;
}
