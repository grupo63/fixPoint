import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

type Role = 'user' | 'professional';
type Action = 'login' | 'register';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    // Si viene un state ya JSON (desde el front), lo respetamos tal cual
    const rawState = (req.query?.state as string | undefined)?.trim();

    let state: string | undefined = rawState && rawState.length ? rawState : undefined;

    if (!state) {
      // Construimos un JSON consistente con lo que el back espera
      const roleParam = (req.query?.role as string | undefined)?.toLowerCase();
      const actionParam = (req.query?.action as string | undefined)?.toLowerCase();
      const next = (req.query?.next as string | undefined) || '/';

      let role: Role | undefined =
        roleParam === 'professional' || roleParam === 'user'
          ? (roleParam as Role)
          : undefined;

      // Si no vino role, lo inferimos del referer como último recurso
      if (!role) {
        const ref = (req.headers.referer || req.headers.referrer) as string | undefined;
        role = /professional/i.test(ref || '') ? 'professional' : 'user';
      }

      const action: Action = actionParam === 'register' ? 'register' : 'login';

      state = JSON.stringify({ role, action, next, t: Date.now() });
    }

    return {
      state,
      scope: ['profile', 'email'],
      prompt: 'select_account',
    };
  }
}
