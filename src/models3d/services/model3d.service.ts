import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model3d as Model3dEntity } from 'src/typeorm/entities/model3d';
import { User as UserEntity } from 'src/typeorm/entities/user';
import { QueryFailedError, Repository } from 'typeorm';
import { File as FileEntity } from 'src/typeorm/entities/file';
import { File } from '../types/file';
import { Model3d } from '../types/model3d-body';
import { Subscribed3dModels } from 'src/typeorm/entities/saved-models';
import { Range } from 'interfaces/range.interface';

@Injectable()
export class Model3dService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Model3dEntity)
    private readonly model3dRepository: Repository<Model3dEntity>,
    @InjectRepository(FileEntity)
    private readonly filesRepository: Repository<FileEntity>,
    @InjectRepository(Subscribed3dModels)
    private readonly subscribed3dModelsRepository: Repository<Subscribed3dModels>,
  ) {}

  async get3dModel(id: string) {
    try {
      return await this.model3dRepository.findOne({
        where: { id },
        relations: { user: true, files: true },
      });
    } catch (error) {
      throw error;
    }
  }

  async get3dModels(cursor: string | undefined, limit: number) {
    const queryBuilder = this.model3dRepository.createQueryBuilder('model');

    if (cursor)
      queryBuilder.where('model.id > :cursor', { cursor: atob(cursor) });

    return await queryBuilder.orderBy('model.id', 'ASC').take(limit).getMany();
  }

  // async get3dModels(range: Range) {
  //   const items = await this.model3dRepository.find({
  //     skip: range.from,
  //     take: range.to - range.from,
  //   });

  //   return items;
  // }

  async create3dModel(model3d: Model3dEntity) {
    try {
      return await this.model3dRepository.save(model3d);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async subscribe3dModelToUser(model3d: Model3dEntity, user: UserEntity) {
    try {
      return await this.subscribed3dModelsRepository.insert({ user, model3d });
    } catch (error) {
      console.error(error);
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

  async createFile(file: FileEntity) {
    try {
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

  //////////////////////////=========>>>>>>><<<<<<<<

  // async getSavedPage(userId: string, page: number) {
  //   const items = await this.subscribed3dModelsRepository.find({
  //     skip: (page - 1) * this.PAGE_SIZE,
  //     take: this.PAGE_SIZE,
  //     where: { userId },
  //     relations: { model3d: true },
  //   });

  //   const rawItems = items.map((item) => item.model3d);

  //   return rawItems;
  // }

  async getFileByModel3d(id: string, ext?: string) {
    const file = await this.filesRepository.findOne({
      where: { model3d: { id }, name: ext },
    });

    return file;
  }

  async getFilesByModel3d(model3dId: string) {
    const files = await this.filesRepository.find({
      where: { model3d: { id: model3dId } },
    });

    return files;
  }

  async userSavedModel3d(userId: string, model3dId: string) {
    try {
      const entitiesNum = await this.subscribed3dModelsRepository.count({
        where: { userId, model3dId },
      });
      return !!entitiesNum;
    } catch (error) {
      throw error;
    }
  }
}
