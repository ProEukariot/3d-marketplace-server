import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Model3d } from 'src/typeorm/entities/Model3d';
import { File } from 'src/typeorm/entities/File';
import { SavedModel } from 'src/typeorm/entities/SavedModels';
import { User } from 'src/typeorm/entities/User';

export default registerAs(
  'typeorm',
  (): TypeOrmModuleOptions => ({
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    entities: [User, Model3d, File, SavedModel],
    // autoLoadEntities: true,
    synchronize: true,
    options: { encrypt: false, trustServerCertificate: true },
  }),
);
