import { Injectable } from '@nestjs/common';
import { UserRepository } from './users.repository';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDTO } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  getUsers(page: number, limit: number) {
    return this.userRepository.getUsers(page, limit);
  }

  getUsersByRole(role: string) {
    return this.userRepository.getUsersByRole(role);
  }

  getUserById(id: string) {
    return this.userRepository.getUserById(id);
  }

  updateUser(id: string, user: UpdateUserDTO) {
    return this.userRepository.updateUser(id, user);
  }

  deleteUser(id: string) {
    return this.userRepository.deleteUser(id);
  }

  reactivateUser(id: string) {
    return this.userRepository.reactivateUser(id);
  }
}
