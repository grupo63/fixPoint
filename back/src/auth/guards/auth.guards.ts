import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { TemporaryRole } from 'src/users/types/temporary-role';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const auth =
      req.cookies?.access_token || req.headers.authorization?.split(' ')[1];

    if (!auth) throw new UnauthorizedException('No token sent');

    try {
      const secret = process.env.JWT_SECRET;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const payload = this.jwt.verify(auth, { secret });

      payload.iat = payload.iat ? new Date(payload.iat * 1000) : null;
      payload.exp = payload.exp ? new Date(payload.exp * 1000) : null;

      req.user = {
        ...payload,
        roles:
          payload.role === TemporaryRole.ADMIN
            ? [TemporaryRole.ADMIN]
            : payload.role === TemporaryRole.PROFESSIONAL
              ? [TemporaryRole.PROFESSIONAL]
              : [TemporaryRole.USER],
      };

      return true;
    } catch (error) {
      throw new UnauthorizedException('Error validating token');
    }
  }
}
