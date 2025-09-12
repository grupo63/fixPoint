import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TemporaryRole } from 'src/users/types/temporary-role';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!required || required.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();

    const rawRole = request.user?.role;
    const rawRoles = request.user?.roles;

    const userRoles: string[] = Array.isArray(rawRoles)
      ? rawRoles
      : rawRole
        ? [rawRole]
        : [];

    const normUserRoles = userRoles.map((r) => r?.toString().toUpperCase());
    const normRequired = required.map((r) => r?.toString().toUpperCase());

    const ok = normRequired.some((r) => normUserRoles.includes(r));

    if (!ok) throw new ForbiddenException('Access Denied');
    return true;
  }
}
