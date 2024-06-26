import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Model3d } from './model3d';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: number;

  @Column()
  name: string;

  @Column()
  target: string;

  @Column({ default: 'private' })
  access: 'private' | 'public';

  @ManyToOne(() => Model3d, (model3d) => model3d.files)
  model3d: Model3d;

  url?: string;
}
