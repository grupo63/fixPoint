import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserRepository } from './users.repository';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(user: Partial<User>) {
    const { email, password, name } = user;
    if (!email || !password || !name)
      throw new BadRequestException('Se necesitan email, contraseña y nombre');
    const foundUser = await this.userRepository.getUserByEmailAuth(email);
    if (foundUser)
      throw new ConflictException(`El email ${email} ya esta en uso`);

    const hashedPassword = await bcrypt.hash(password, 10);
    const { role, ...userWhitoutRole } = user;
    const userToSave = { ...userWhitoutRole, password: hashedPassword };

    return await this.userRepository.signUp(userToSave);
  }

  async signIn(email: string, password: string) {
    const foundUser = await this.userRepository.getUserByEmailAuth(email);
    if (!foundUser) throw new NotFoundException('User not found');

    const validPassword = await bcrypt.compare(password, foundUser.password);
    if (!validPassword)
      throw new NotFoundException('Email or password are incorrect');

    const payload = {
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'User logged in successfully',
      token,
    };
  }

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
}
