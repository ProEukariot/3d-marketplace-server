import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model3d } from 'src/typeorm/entities/model3d';
import { User } from 'src/typeorm/entities/user';
import { QueryFailedError, Repository } from 'typeorm';
import { File } from 'src/typeorm/entities/file';
import { FileMeta } from '../types/file-meta';
import { Model3dBody } from '../types/model3d-body';
import { SavedModel } from 'src/typeorm/entities/saved-models';

@Injectable()
export class Model3dService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Model3d)
    private readonly model3dRepository: Repository<Model3d>,
    @InjectRepository(File)
    private readonly filesRepository: Repository<File>,
    @InjectRepository(SavedModel)
    private readonly savedModelsRepository: Repository<SavedModel>,
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

  // async getFile(id: string) {
  //   try {
  //     return await this.filesRepository.findOneOrFail({
  //       where: { id },
  //       relations: {
  //         model3d: true,
  //       },
  //     });
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  // async getUserByFileId(fileId: string) {
  //   const queryBuilder = this.userRepository.createQueryBuilder('user');

  //   const user = await queryBuilder
  //     .leftJoinAndSelect('user.models', 'models')
  //     .leftJoinAndSelect('models.files', 'files')
  //     .getOne();

  //   return user;
  // }

  async getPage(page: number) {
    const pageSize = 4;

    const items = await this.model3dRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return items;
  }

  async getModel3d(id: string) {
    const model = await this.model3dRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    return model;
  }

  async getFileByModel3d(id: string, ext?: string) {
    const file = await this.filesRepository.findOne({
      where: { model3d: { id }, ext },
    });

    return file;
  }

  async getFilesByModel3d(model3dId: string) {
    const files = await this.filesRepository.find({
      where: { model3d: { id: model3dId } },
    });

    return files;
  }

  async saveUsersModel3d(model3dId: string, userId: string) {
    try {
      return await this.savedModelsRepository.insert({ userId, model3dId });
    } catch (error) {
      throw error;
    }

    // const userPromise = this.userRepository.findOneOrFail({
    //   where: { id: userId },
    //   select: { id: true },
    // });
    // const model3dPromise = this.model3dRepository.findOneOrFail({
    //   where: { id: model3dId },
    //   select: { id: true },
    // });

    // const [user, model3d] = await Promise.all([userPromise, model3dPromise]);

    // const savedModel = new SavedModel();
    // savedModel.model3d = model3d;
    // savedModel.user = user;
    // return await this.savedModelsRepository.save(savedModel);
  }
}
