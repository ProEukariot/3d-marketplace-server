import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model3d } from 'src/typeorm/entities/Model3d';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';
import { File } from 'src/typeorm/entities/File';
import { FileMeta } from '../types/FileMeta';
import { Model3dBody } from '../types/Model3dBody';

@Injectable()
export class Model3dService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Model3d)
    private readonly model3dRepository: Repository<Model3d>,
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
  ) {}

  async createModel3d(model3dBody: Model3dBody, userId: string) {
    try {
      const user = await this.userRepository.findOneByOrFail({
        id: userId,
      });

      const model3d = new Model3d();
      model3d.name = model3dBody.name;
      model3d.price = model3dBody.amount;
      model3d.user = user;

      return await this.model3dRepository.save(model3d);
    } catch (error) {
      throw error;
    }
  }

  async createFile(fileMeta: FileMeta, model3dId: string) {
    try {
      const model3d = await this.model3dRepository.findOneByOrFail({
        id: model3dId,
      });

      const file = new File();
      file.size = fileMeta.size;
      file.ext = fileMeta.ext;
      file.model3d = model3d;

      return await this.filesRepository.save(file);
    } catch (error) {
      throw error;
    }
  }

  async getFile(id: string) {
    try {
      return await this.filesRepository.findOneOrFail({
        where: { id },
        relations: {
          model3d: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserByFileId(fileId: string) {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    const user = await queryBuilder
      .leftJoinAndSelect('user.models', 'models')
      .leftJoinAndSelect('models.files', 'files')
      .getOne();

    return user;
  }

  async getPage(page: number) {
    const pageSize = 5;

    const items = await this.model3dRepository.find({
      skip: (page - 1) * pageSize,
      take: page,
    });

    return items;
  }
}
