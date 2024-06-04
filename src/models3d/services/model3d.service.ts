import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Model3d as Model3dEntity } from 'src/typeorm/entities/model3d';
import { User as UserEntity } from 'src/typeorm/entities/user';
import {
  FindOptionsRelationByString,
  FindOptionsRelations,
  QueryFailedError,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { File as FileEntity } from 'src/typeorm/entities/file';
import { File } from '../types/file';
import { Model3d } from '../types/model3d-body';
import { Subscribed3dModels } from 'src/typeorm/entities/subscribed-models3d';
import { Range } from 'interfaces/range.interface';
import { access } from 'fs';

export type FilterOptions = {
  pattern?: string;
  minRange?: number;
  maxRange?: number;
};
export type PageOptions = { limit: number; cursor?: string };

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
    private readonly subscriptionRepository: Repository<Subscribed3dModels>,
  ) {}

  private apply3dModelsFilters(
    qb: SelectQueryBuilder<Model3dEntity>,
    filtering: FilterOptions,
  ) {
    if (filtering.pattern)
      qb.andWhere('model.name LIKE :pattern', {
        pattern: `%${filtering.pattern}%`,
      });

    if (filtering.minRange)
      qb.andWhere('model.price >= :minRange', {
        minRange: filtering.minRange,
      });

    if (filtering.maxRange)
      qb.andWhere('model.price <= :maxRange', {
        maxRange: filtering.maxRange,
      });

    return qb;
  }

  private apply3dModelsPagination(
    qb: SelectQueryBuilder<Model3dEntity>,
    pagination: PageOptions,
  ) {
    if (pagination.cursor)
      qb.andWhere('model.id > :cursor', {
        cursor: atob(pagination.cursor),
      });

    return qb;
  }

  async get3dModel(
    id: string,
    relations?:
      | FindOptionsRelationByString
      | FindOptionsRelations<Model3dEntity>,
  ) {
    try {
      return await this.model3dRepository.findOne({
        where: { id },
        relations: relations,
      });
    } catch (error) {
      throw error;
    }
  }

  async get3dModels(pagination: PageOptions, filtering: FilterOptions) {
    try {
      const queryBuilder = this.model3dRepository.createQueryBuilder('model');

      queryBuilder.where('1 = 1');

      this.apply3dModelsFilters(queryBuilder, filtering);
      this.apply3dModelsPagination(queryBuilder, pagination);

      queryBuilder.orderBy('model.id', 'ASC').take(pagination.limit);

      // console.log(queryBuilder.getQuery());

      return await queryBuilder.getMany();
    } catch (error) {
      throw error;
    }
  }

  async getPublicFileBy3dModel(id: string, target: string) {
    try {
      const builder = this.filesRepository.createQueryBuilder('file');

      return (
        builder
          // .select(['file.id', 'file.target', 'file.access', 'model.id', 'user.id'])
          .leftJoinAndSelect('file.model3d', 'model')
          .leftJoinAndSelect('model.user', 'user')
          .where('model.id = :id', { id })
          .andWhere('file.access = :access', { access: 'public' })
          .andWhere('file.target = :target', { target })
          .getOne()
      );
    } catch (err) {
      throw err;
    }
  }

  async incrementDownloads(model3d: Model3dEntity) {
    model3d.downloads++;
    return await this.model3dRepository.save(model3d);
  }

  async getSubscribed3dModel(
    user: UserEntity,
    model3d: Model3dEntity,
    relations?:
      | FindOptionsRelationByString
      | FindOptionsRelations<Subscribed3dModels>,
  ) {
    try {
      return await this.subscriptionRepository.findOne({
        where: { user, model3d },
        relations,
      });
    } catch (error) {
      throw error;
    }
  }

  async getSubscribed3dModels(
    user: UserEntity,
    pagination: PageOptions,
    filtering: FilterOptions,
  ) {
    try {
      const queryBuilder = this.model3dRepository.createQueryBuilder('model');

      queryBuilder.innerJoin(
        'model.savedModels',
        'savedModels',
        'model.id = savedModels.model3dId AND savedModels.userId = :userId',
        { userId: user.id },
      );

      queryBuilder.where('1 = 1');

      this.apply3dModelsFilters(queryBuilder, filtering);
      this.apply3dModelsPagination(queryBuilder, pagination);

      queryBuilder.orderBy('model.id', 'ASC').take(pagination.limit);

      return await queryBuilder.getMany();
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
      return await this.subscriptionRepository.insert({ user, model3d });
    } catch (error) {
      throw error;
    }
  }

  async getPriceRange() {
    try {
      const minPromise = this.model3dRepository.minimum('price');
      const maxPromise = this.model3dRepository.maximum('price');

      const [min, max] = await Promise.all([minPromise, maxPromise]);

      return { min, max };
    } catch (error) {
      throw error;
    }
  }
}
