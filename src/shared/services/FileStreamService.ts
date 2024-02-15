import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FileStreamService {
  constructor() {}

  writeFile(file: Express.Multer.File, fileName: string, destination: string) {
    const projPath = path.resolve(__dirname, '../../../');
    const filePath = path.join(projPath, destination, fileName);

    try {
      fs.writeFileSync(filePath, file.buffer);
    } catch (err) {
      throw err;
    }
  }
}
