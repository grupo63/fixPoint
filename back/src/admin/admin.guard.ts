import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const roles: string[] = req.user?.roles ?? [];
    if (!roles.includes('admin')) {
      throw new ForbiddenException('Admin only');
    }
    return true;
  }
}