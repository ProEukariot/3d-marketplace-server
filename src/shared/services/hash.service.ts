import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  readonly ROUNDS = 12;

  async getHash(value: string) {
    return await bcrypt.hash(value, this.ROUNDS);
  }

  async compareHash(value: string, hash: string) {
    return await bcrypt.compare(value, hash);
  }
}
