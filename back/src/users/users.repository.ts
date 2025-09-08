import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(user: Partial<User>) {
    const newUser = await this.userRepository.save(user);

    const dbUser = await this.userRepository.findOneBy({ id: newUser.id });
    if (!dbUser) throw new NotFoundException('User not found');

    //Para no mostrar la contraseña del usuario
    const { password, ...filteredData } = dbUser;
    return filteredData;
  }

  async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const users = await this.userRepository.find({
      take: limit,
      skip: skip,
    });

    return users.map(({ password, ...userNoPassord }) => userNoPassord);
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException(`User whit id ${id} not found`);

    const { password, role, ...filteredData } = user;
    return filteredData;
  }

  async createUser(user: Partial<User>) {
    return this.userRepository.save(user);
  }

  async updateUser(id: string, user: Partial<User>) {
    await this.userRepository.update(id, user);
    const updateUser = await this.userRepository.findOneBy({ id });
    if (!updateUser)
      throw new NotFoundException(`User whit id ${id} not found`);

    const { password, role, ...filteredData } = updateUser;
    return filteredData;
  }

  async deleteUser(id: string) {
    const foundUser = await this.userRepository.findOneBy({ id });
    if (!foundUser) throw new NotFoundException(`User whit id ${id} not found`);
    await this.userRepository.delete(id);

    const { password, role, ...filteredUserData } = foundUser;
    return filteredUserData;
  }

  // async getUserByEmailAuth(email: string) {
  //   return this.userRepository.findOneBy({ email });
  // }
}
