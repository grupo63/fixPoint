import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<Request>();

    let state =
      (req.query?.state as string | undefined) ??
      (req.query?.role as string | undefined);

    if (!state) {
      const ref = (req.headers.referer || req.headers.referrer) as
        | string
        | undefined;
      if (ref) {
        state = /professional/i.test(ref) ? 'professional' : 'user';
      }
    }

    return { state };
  }
}
