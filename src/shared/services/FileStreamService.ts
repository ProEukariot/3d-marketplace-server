import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { dir } from 'console';

@Injectable()
export class FileStreamService {
  constructor() {}

  private readonly projPath = path.resolve(__dirname, '../../../');

  createDirectory(dir: string) {
    const dirPath = path.join(this.projPath, dir);

    if (!fs.existsSync(dirPath)) {
      fs.mkdir(dirPath, (err) => {
        if (err) throw err;
      });
    }
  }

  // writeFile(file: Express.Multer.File, fileName: string, destination: string) {
  //   const filePath = path.join(this.projPath, destination, fileName);

  //   fs.writeFile(filePath, file.buffer, (err) => {
  //     if (err) throw err;
  //   });
  // }

  getWriteStream(fileName: string, destination: string) {
    try {
      const filePath = path.join(this.projPath, destination, fileName);

      const ws = fs.createWriteStream(filePath);

      return ws;
    } catch (error) {
      throw error;
    }
  }

  getReadStream(fileName: string, directory: string) {
    try {
      const filePath = path.resolve(this.projPath, directory, fileName);

      const rs = fs.createReadStream(filePath);

      return rs;
    } catch (error) {
      throw error;
    }
  }
}
