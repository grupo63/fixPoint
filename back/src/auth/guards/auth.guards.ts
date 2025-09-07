import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtUser {
  sub?: string;
  id?: string;
  email: string;
  role?: string;
  roles?: string[];
  iat?: number;
  exp?: number;
  _iatDate?: Date;
  _expDate?: Date;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const auth = req.headers['authorization'] as string | undefined;

    if (!auth) throw new UnauthorizedException('No token sent');

    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    try {
      const payload = this.jwt.verify<JwtUser>(token);

      if (payload.iat) payload._iatDate = new Date(payload.iat * 1000);
      if (payload.exp) payload._expDate = new Date(payload.exp * 1000);

      const single = payload.role ? [payload.role] : [];
      const arr = Array.isArray(payload.roles) ? payload.roles : single;

      req.user = { ...payload, roles: arr } as JwtUser;

      return true;
    } catch (e: any) {
      throw new UnauthorizedException('Error validating token');
    }
  }
}
