import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(user: Partial<User>) {
    const { email, password, ...rest } = user;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const exists = await this.authRepository.findByEmail(email);
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await this.authRepository.createUser({
      email,
      password: passwordHash,
      ...rest,
    });

    return created;
  }

  async signIn(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const foundUser = await this.authRepository.findByEmail(email);
    if (!foundUser) {
      throw new BadRequestException('Invalid email or password');
    }

    const isValid = await bcrypt.compare(password, (foundUser as any).password);
    if (!isValid) {
      throw new BadRequestException('Invalid email or password');
    }

    const payload = {
      sub: foundUser.id,
      email: foundUser.email,
      role: foundUser.role,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
