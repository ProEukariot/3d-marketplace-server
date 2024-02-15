import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model3d } from 'src/typeorm/entities/Model3d';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';
import { UploadModelDto } from '../dto/uploadModelDto';

@Injectable()
export class Model3dService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Model3d)
    private readonly model3dRepository: Repository<Model3d>,
  ) {}

  async createModel(modelDto: UploadModelDto, userId: string) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    const model3d = new Model3d();
    model3d.name = modelDto.name;
    model3d.price = modelDto.amount;
    model3d.user = user;

    return await this.model3dRepository.save(model3d);
  }
}
