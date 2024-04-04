import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/user';
import { Repository } from 'typeorm';
import { CreateUserParams } from '../types/create-user-params';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(createUserParams: CreateUserParams) {
    const newUser = this.userRepository.create({
      username: createUserParams.username,
      hash: createUserParams.hash,
      email: createUserParams.email,
    });

    return await this.userRepository.save(newUser);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });

    return user;
  }

  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });

    return user;
  }
}
