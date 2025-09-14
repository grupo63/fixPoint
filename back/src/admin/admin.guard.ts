import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();

    // Soportar ambos esquemas por compatibilidad:
    // - role: string
    // - roles: string[]
    const role: string | undefined = req.user?.role;
    const rolesArr: string[] = Array.isArray(req.user?.roles) ? req.user.roles : [];
    const isAdmin = role === 'admin' || rolesArr.includes('admin');

    if (!isAdmin) {
      throw new ForbiddenException('Admin only');
    }
    return true;
  }
}