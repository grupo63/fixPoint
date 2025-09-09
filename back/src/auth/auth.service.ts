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
    // [SAFE ROLE PATCH] aceptar 'role' pero ignorarlo
    const { email, password, role: _ignoredRole, ...rest } = user as any;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const exists = await this.authRepository.findByEmail(email);
    if (exists) throw new ConflictException('Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);

    // [SAFE ROLE PATCH] forzar rol seguro por backend
    const created = await this.authRepository.createUser({
      email,
      password: passwordHash,
      role: 'user', // nunca confiamos en el body
      ...rest,
    });

    return created;
  }

  async signIn(email: string, password: string) {
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // [CHANGE] asegúrate de traer password para poder comparar
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
      role: (foundUser as any).role,
    };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  // ---------- [ADD] Google/GitHub OAuth ----------
  async issueJwtFromOAuth(oauthUser: {
    email: string | null;
    name: string;
    provider: 'google' | 'github';
    providerId: string;
  }): Promise<string> {
    if (!oauthUser.providerId) {
      throw new BadRequestException('Invalid OAuth profile');
    }

    // 1) intenta por providerId
    let user = await this.authRepository.findByProviderId(oauthUser.providerId);

    // 2) si no existe, intenta enlazar por email
    if (!user && oauthUser.email) {
      const byEmail = await this.authRepository.findByEmail(oauthUser.email);
      if (byEmail) {
        (byEmail as any).provider = oauthUser.provider;
        (byEmail as any).providerId = oauthUser.providerId;
        await this.authRepository.save(byEmail as any);
        user = byEmail as any;
      }
    }

    // 3) crear si no existe
    if (!user) {
      if (!oauthUser.email) {
        throw new BadRequestException(
          'Google no proporcionó un email para esta cuenta. No es posible crear el usuario.',
        );
      }

      // separar "name" en firstName / lastName según tu entidad
      const raw = oauthUser.name?.trim() ?? '';
      const [firstName, ...restParts] = raw.length ? raw.split(/\s+/) : [''];
      const lastName = restParts.length ? restParts.join(' ') : null;

      const toCreate: Partial<User> = {
        email: oauthUser.email,
        password: null, // usuarios OAuth no necesitan password
        provider: oauthUser.provider,
        providerId: oauthUser.providerId,
        role: 'user', // [SAFE ROLE PATCH] rol seguro por defecto también en OAuth
      };

      // añadir nombres si existen (tu entidad los tiene como opcionales)
      (toCreate as any).firstName = firstName || null;
      (toCreate as any).lastName = lastName || null;

      user = (await this.authRepository.createUser(toCreate)) as unknown as User;
    }

    // 4) emite tu JWT estándar
    const payload = {
      sub: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    };
    return this.jwtService.signAsync(payload);
  }
}