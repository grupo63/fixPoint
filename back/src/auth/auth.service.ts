import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { User } from 'src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/auth.dto';
import { NotificationsService } from 'src/notifications/notification.service';
import { Subscription } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService, // usa JwtModule global
    private readonly notificationsService: NotificationsService,
  ) {}

  async signUp(user: CreateUserDto) {
    const { role, email, password, firstName, lastName } = user;

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
      firstName,
      lastName,
      password: passwordHash,
      role: internalRole,
    });

    try {
      await this.notificationsService.sendWelcomeEmail({
        name: user.firstName || 'Usuario',
        email: user.email,
      });
      this.logger.log(`Correo de bienvenida enviado a ${user.email}`);
    } catch (error) {
      this.logger.error(
        `Error al enviar correo de bienvenida a ${user.email}`,
        error,
      );
      // Si el envío del correo no es crítico, no lanzamos excepción
    }
    //Envio de email sobre la creacion de usuario:
    // await this.notificationsService.sendWelcomeEmail({
    //   name: user.firstName || 'Usuario',
    //   email,
    // });

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
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      email: foundUser.email,
      role: (foundUser as any).role,
    };

    const access_token = this.jwtService.sign(payload); // usa config global
    return { access_token };
  }

  async loginOrCreateGoogleUser(
    profile: {
      providerId: string;
      email: string;
      name: string;
      picture?: string;
      given_name?: string;
      family_name?: string;
    },
    roleHint?: 'user' | 'professional',
    action: 'login' | 'register' = 'login',
  ): Promise<User> {
    const { providerId, email, name, picture, given_name, family_name } =
      profile;

    const firstName: string | undefined =
      given_name ?? (name ? name.trim().split(/\s+/)[0] : undefined);

    const lastName: string | undefined =
      family_name ??
      (name
        ? name.trim().split(/\s+/).slice(1).join(' ') || undefined
        : undefined);

    // 1) Buscar por Google ID
    let user = await this.authRepository.findByGoogleId(providerId);
    if (user) return user;

    // 2) Buscar por email
    user = await this.authRepository.findByEmail(email);
    if (user) {
      if (!(user as any).googleId) (user as any).googleId = providerId;
      if (!(user as any).firstName && firstName)
        (user as any).firstName = firstName;
      if (!(user as any).lastName && lastName)
        (user as any).lastName = lastName;
      if (!(user as any).profileImage)
        (user as any).profileImage = picture ?? null;
      return this.authRepository.save(user);
    }

    // 3) No existe → depende de la acción
    if (action === 'login') {
      throw new BadRequestException(
        'No Google account is registered with this email. Please sign up first.',
      );
    }

    // Crear usuario nuevo (register) con roleHint
    return this.authRepository.findOrCreateFromGoogle(
      {
        providerId,
        email,
        name,
        picture,
        given_name: firstName,
        family_name: lastName,
      },
      roleHint || 'user',
    );
  }

  signTokens(user: { id: string; email: string; role: string }) {
    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
