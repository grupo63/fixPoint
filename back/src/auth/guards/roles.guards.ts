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

    // Si el endpoint no declaró roles, permitimos
    if (!required || required.length === 0) return true;

    const request = ctx.switchToHttp().getRequest();

    // Aceptar user.role (string) o user.roles (string[])
    const rawRole = request.user?.role; // <--- viene de tu token
    const rawRoles = request.user?.roles; // por si en algún lugar ya armás array

    const userRoles: string[] = Array.isArray(rawRoles)
      ? rawRoles
      : rawRole
        ? [rawRole]
        : [];

    // Normalizar a mayúsculas para evitar problemas de 'user' vs 'USER'
    const normUserRoles = userRoles.map((r) => r?.toString().toUpperCase());
    const normRequired = required.map((r) => r?.toString().toUpperCase());

    const ok = normRequired.some((r) => normUserRoles.includes(r));

    if (!ok) throw new ForbiddenException('Access Denied');
    return true;
  }
}

//   canActivate(ctx: ExecutionContext): boolean {
//     const required = this.reflector.getAllAndOverride<TemporaryRole[]>(
//       'roles',
//       [ctx.getHandler(), ctx.getClass()],
//     );

//     const request = ctx.switchToHttp().getRequest();
//     const hasRole = () =>
//       required.some((role) => request.user?.roles?.includes(role));
//     const valid = request.user && request.user.roles && hasRole();

//     if (!valid) throw new ForbiddenException('Access Denied');

//     return true;
//   }
// }
