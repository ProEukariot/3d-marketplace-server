import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Model3d } from 'src/typeorm/entities/model3d';
import { File } from 'src/typeorm/entities/file';
import { Subscribed3dModels } from 'src/typeorm/entities/saved-models';
import { User } from 'src/typeorm/entities/user';

export default registerAs(
  'typeorm',
  (): TypeOrmModuleOptions => ({
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Model3d, File, Subscribed3dModels],
    // autoLoadEntities: true,
    synchronize: true,
    options: { encrypt: false, trustServerCertificate: true },
  }),
);
