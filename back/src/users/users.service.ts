import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { User } from './entities/user.entity';
// import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  getUsers(page: number, limit: number) {
    return this.userRepository.getUsers(page, limit);
  }

  getUserById(id: string) {
    return this.userRepository.getUserById(id);
  }

  updateUser(id: string, user: Partial<User>) {
    return this.userRepository.updateUser(id, user);
  }

  deleteUser(id: string) {
    return this.userRepository.deleteUser(id);
  }

  reactivateUser(id: string) {
    return this.userRepository.reactivateUser(id);
  }
}
