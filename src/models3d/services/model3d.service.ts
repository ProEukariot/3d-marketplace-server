import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model3d as Model3dEntity } from 'src/typeorm/entities/model3d';
import { User as UserEntity } from 'src/typeorm/entities/user';
import { QueryFailedError, Repository } from 'typeorm';
import { File as FileEntity } from 'src/typeorm/entities/file';
import { File } from '../types/file';
import { Model3d } from '../types/model3d-body';
import { Subscribed3dModels } from 'src/typeorm/entities/subscribed-models3d';
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

  async get3dModel(id: string, extras?: { user?: boolean; files?: boolean }) {
    try {
      return await this.model3dRepository.findOne({
        where: { id },
        relations: extras,
      });
    } catch (error) {
      throw error;
    }
  }

  async get3dModels(limit: number, cursor?: string) {
    try {
      const queryBuilder = this.model3dRepository.createQueryBuilder('model');

      if (cursor)
        queryBuilder.where('model.id > :cursor', { cursor: atob(cursor) });

      return await queryBuilder
        .orderBy('model.id', 'ASC')
        .take(limit)
        .getMany();
    } catch (error) {
      throw error;
    }
  }

  async getSubscribed3dModels(
    user: UserEntity,
    limit: number,
    cursor?: string,
  ) {
    try {
      const queryBuilder =
        this.subscribed3dModelsRepository.createQueryBuilder('subscribedModel');

      queryBuilder
        .leftJoinAndSelect(
          'subscribedModel.model3d',
          // Model3dEntity,
          'model',
          'subscribedModel.model3dId = model.id',
        )
        .where('subscribedModel.userId = :id', { id: user.id });

      if (cursor)
        queryBuilder.andWhere('model.id > :cursor', { cursor: atob(cursor) });

      queryBuilder.orderBy('model.id', 'ASC').take(limit);

      // console.log(queryBuilder.getSql());

      const subscribed3dModels = await queryBuilder.getMany();
      const models = subscribed3dModels.map((sm) => sm.model3d);

      return models;
    } catch (error) {
      throw error;
    }
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
      throw error;
    }
  }

  async createFile(file: FileEntity) {
    try {
      return await this.filesRepository.save(file);
    } catch (error) {
      throw error;
    }
  }

  async subscribe3dModelToUser(model3d: Model3dEntity, user: UserEntity) {
    try {
      return await this.subscribed3dModelsRepository.insert({ user, model3d });
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
}
