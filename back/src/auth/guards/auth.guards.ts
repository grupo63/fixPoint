import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { TemporaryRole } from 'src/users/types/temporary-role';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token sent');
    }

    const token = header.slice('Bearer '.length).trim();

    try {
      const payload = this.jwt.verify(token) as any; // usa JwtModule global

      const id = payload.id ?? payload.sub ?? payload.userId;
      if (!id) {
        throw new UnauthorizedException('Invalid token payload: missing id/sub/userId');
      }

      req.user = {
        id,
        email: payload.email ?? null,
        role: payload.role ?? null,
        roles:
          payload.role === TemporaryRole.ADMIN
            ? [TemporaryRole.ADMIN]
            : payload.role === TemporaryRole.PROFESSIONAL
            ? [TemporaryRole.PROFESSIONAL]
            : [TemporaryRole.USER],
        iat: payload.iat ? new Date(payload.iat * 1000) : null,
        exp: payload.exp ? new Date(payload.exp * 1000) : null,
      };

      return true;
    } catch (error: any) {
      // console.error('[JwtAuthGuard] verify error:', error?.name, error?.message);
      throw new UnauthorizedException('Error validating token');
    }
  }
}
