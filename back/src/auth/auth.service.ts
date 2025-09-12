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
import { DeepPartial } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { role, name, email, password, ...rest } = user;
    const roleMap = {
      user: 'USER',
      professional: 'PROFESSIONAL',
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

  async validateOrCreateGoogleUser(
    oauth: {
      providerId?: string;
      googleId?: string;
      email: string;
      name: string;
      picture?: string;
    },
    roleHint: 'user' | 'professional',
  ) {
    const providerId = oauth.providerId ?? oauth.googleId;
    if (!providerId || !oauth.email) {
      throw new BadRequestException('Google profile incomplete');
    }

    const profile = {
      providerId,
      email: oauth.email,
      name: oauth.name,
      picture: oauth.picture,
    };

    return this.authRepository.findOrCreateFromGoogle(profile, roleHint);
  }

  async loginOrCreateGoogleUser(
    profile: {
      providerId: string;
      email: string;
      name: string;
      picture?: string;
    },
    roleHint?: 'user' | 'professional',
  ): Promise<User> {
    const { providerId, email, name, picture } = profile;

    let user = await this.authRepository.findByGoogleId(providerId);
    if (user) return user;

    user = await this.authRepository.findByEmail(email);
    if (user) {
      if (!(user as any).googleId) (user as any).googleId = providerId;
      if (!(user as any).firstName) (user as any).firstName = name;
      if (!(user as any).profileImage)
        (user as any).profileImage = picture ?? null;
      return this.authRepository.save(user);
    }

    if (!roleHint) {
      throw new BadRequestException(
        'No existe una cuenta registrada con Google para este email. Registrate primero.',
      );
    }

    return this.authRepository.findOrCreateFromGoogle(
      { providerId, email, name, picture },
      roleHint,
    );
  }

  signTokens(user: { id: string; email: string }) {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
    return { accessToken };
  }
}
