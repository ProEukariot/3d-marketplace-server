import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/typeorm/entities/User';
import { Repository } from 'typeorm';
import { CreateUserParams } from '../types/createUserParams';

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
}
