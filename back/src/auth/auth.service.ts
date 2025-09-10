// back/src/auth/auth.service.ts
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { TemporaryRole } from 'src/users/types/temporary-role';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { email, password, role, name, ...rest } = user;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const exists = await this.authRepository.findByEmail(email);
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);

    // Normalizamos role
    const safeRole: TemporaryRole =
      role === TemporaryRole.PROFESSIONAL
        ? TemporaryRole.USER
        : (role ?? TemporaryRole.USER);

    // Parseo de name -> firstName / lastName
    const rawName = (name ?? '').trim();
    const [firstNamePart, ...restParts] = rawName ? rawName.split(/\s+/) : [''];
    const lastNamePart = restParts.length ? restParts.join(' ') : undefined;

    // Armamos el payload sin usar null; omitimos claves cuando no hay valor
    const payload: Partial<User> = {
      email,
      password: passwordHash,
      role: safeRole,
      ...(firstNamePart ? { firstName: firstNamePart } : {}),
      ...(lastNamePart  ? { lastName:  lastNamePart  } : {}),
      ...rest,
    };

    const created = await this.authRepository.createUser(payload);
    return created;
  }

  async signIn(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const foundUser = await this.authRepository.findByEmail(email);
    if (!foundUser) throw new BadRequestException('Invalid email or password');

    const isValid = await bcrypt.compare(password, (foundUser as any).password);
    if (!isValid) throw new BadRequestException('Invalid email or password');

    const payload = {
      sub: (foundUser as any).id,
      email: (foundUser as any).email,
      role: (foundUser as any).role,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  // ---------- Google/GitHub OAuth ----------
  async issueJwtFromOAuth(oauthUser: {
    email: string | null;
    name: string;
    provider: 'google' | 'github';
    providerId: string;
  }): Promise<string> {
    if (!oauthUser.providerId) {
      throw new BadRequestException('Invalid OAuth profile');
    }

    let user = await this.authRepository.findByProviderId(oauthUser.providerId);

    if (!user && oauthUser.email) {
      const byEmail = await this.authRepository.findByEmail(oauthUser.email);
      if (byEmail) {
        (byEmail as any).provider = oauthUser.provider;
        (byEmail as any).providerId = oauthUser.providerId;
        await this.authRepository.save(byEmail as any);
        user = byEmail as any;
      }
    }

    if (!user) {
      if (!oauthUser.email) {
        throw new BadRequestException(
          'Google no proporcionó un email para esta cuenta. No es posible crear el usuario.',
        );
      }

      const raw = oauthUser.name?.trim() ?? '';
      const [firstNamePart, ...restParts] = raw ? raw.split(/\s+/) : [''];
      const lastNamePart = restParts.length ? restParts.join(' ') : undefined;

      // Evitamos null en propiedades opcionales
      const toCreate: Partial<User> = {
        email: oauthUser.email,
        // Para cuentas OAuth, password puede omitirse si la columna es nullable en DB
        // y en la entidad es opcional. No enviar null, mejor undefined/omitir.
        // Si tu entidad exige string | null explícitamente, entonces ajusta allí.
        ...(oauthUser.provider ? { provider: oauthUser.provider } : {}),
        providerId: oauthUser.providerId,
        role: TemporaryRole.USER,
        ...(firstNamePart ? { firstName: firstNamePart } : {}),
        ...(lastNamePart  ? { lastName:  lastNamePart  } : {}),
      };

      user = (await this.authRepository.createUser(toCreate)) as unknown as User;
    }

    const payload = {
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    };
    return this.jwtService.signAsync(payload);
  }
}
