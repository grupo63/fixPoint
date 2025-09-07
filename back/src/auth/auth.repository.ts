import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthRepository {
  authRepository: any;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createUser(user: Partial<User>) {
    const newUser = await this.userRepository.save(user);
    const dataBase = await this.userRepository.findOneBy({ id: newUser.id });
    if (!dataBase) {
      throw new Error('User not found after creation');
    }
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }
}
