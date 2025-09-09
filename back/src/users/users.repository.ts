import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    if (!foundUser)
      throw new NotFoundException(`User whith id ${id} not found`);

    if (!foundUser.isActive)
      throw new BadRequestException(`User whith id ${id} is already inactive`);

    //Soft delete: marca como inactivo en lugar de eliminar
    await this.userRepository.update(id, {
      isActive: false,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOneBy({ id });
    if (!updatedUser)
      throw new NotFoundException(`User whit id ${id} not found after update`);

    const { password, role, ...filteredUserData } = updatedUser;
    return filteredUserData;
  }

  async reactivateUser(id: string) {
    const foundUser = await this.userRepository.findOneBy({ id });
    if (!foundUser)
      throw new NotFoundException(`User whith id ${id} not found`);
    if (foundUser.isActive)
      throw new BadRequestException(`User whit id ${id} is already active`);

    await this.userRepository.update(id, {
      isActive: true,
      updatedAt: new Date(),
    });

    const updatedUser = await this.userRepository.findOneBy({ id });
    if (!updatedUser)
      throw new NotFoundException(`User whit id ${id} not found after update`);

    const { password, role, ...filteredData } = updatedUser;
    return filteredData;
  }

  // async getUserByEmailAuth(email: string) {
  //   return this.userRepository.findOneBy({ email });
  // }
}
