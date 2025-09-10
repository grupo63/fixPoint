import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/auth.dto';
import { TemporaryRole } from 'src/users/types/temporary-role';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { role, name, email, password, ...rest } = user;
    const roleMap = {
      user: 'USER', // o el valor que tu entidad espere
      professional: 'PROFESSIONAL', // ajustalo al valor que uses
    };
    const internalRole = role ? roleMap[role] : 'USER';

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const exists = await this.authRepository.findByEmail(email);
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);

    const created = await this.authRepository.createUser({
      email,
      password: passwordHash,
      role: internalRole,
    });
    console.log('Created user:', created);
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
      id: foundUser.id,
      email: foundUser.email,
      role: (foundUser as any).role,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }
}
