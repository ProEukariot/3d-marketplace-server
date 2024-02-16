import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Model3d } from './Model3d';

@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  size: number;

  @Column()
  ext: string;

  @ManyToOne(() => Model3d, (model3d) => model3d.files)
  model3d: Model3d;
}
