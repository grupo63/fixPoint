// src/auth/auth.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { GoogleAuthGuard } from './guards/google.guards';
import { JwtAuthGuard } from './guards/auth.guards';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 400 })
  async signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user as any);
  }

  @Post('signin')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 401 })
  signIn(@Body() credentials: LoginUserDto) {
    const { email, password } = credentials;
    return this.authService.signIn(email, password);
  }

  // ===== Google OAuth =====
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Login/Register with Google' })
  @ApiResponse({ status: 302 })
  googleLogin(): any {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302 })
  async googleCallback(@Req() req: ExpressRequest, @Res() res: ExpressResponse) {
    type Role = 'user' | 'professional';

    // Parseo robusto de state
    let roleHint: Role | undefined = undefined;
    let action: 'login' | 'register' = 'login';
    let next = '/';

    try {
      if (typeof req.query.state === 'string') {
        const parsed = JSON.parse(req.query.state);
        const r = String(parsed?.role || '').toLowerCase();
        if (r === 'user' || r === 'professional') roleHint = r as Role;
        const a = String(parsed?.action || '').toLowerCase();
        if (a === 'register') action = 'register';
        if (parsed?.next) next = String(parsed.next);
      }
    } catch {
      const rawState = (req.query?.state as string | undefined)?.toLowerCase();
      const rawRole = (req.query?.role as string | undefined)?.toLowerCase() || rawState;
      if (rawRole === 'user' || rawRole === 'professional') roleHint = rawRole as Role;
      const a = (req.query?.action as string | undefined)?.toLowerCase();
      if (a === 'register') action = 'register';
      const n = req.query?.next as string | undefined;
      if (n) next = n;
    }

    const googleUser = req.user as {
      providerId?: string;
      googleId?: string;
      email?: string;
      name?: string;
      picture?: string;
      given_name?: string;
      family_name?: string;
    };

    const providerId = googleUser?.providerId ?? googleUser?.googleId;
    if (!providerId || !googleUser?.email) {
      throw new BadRequestException('Google profile incomplete (sin email o providerId)');
    }

    // ✅ Definimos FRONT_URL para redirecciones
    const FRONT_URL = process.env.FRONT_URL || 'http://localhost:3000';

    try {
      // Crea/loguea según tu servicio
      const user = await this.authService.loginOrCreateGoogleUser(
        {
          providerId,
          email: googleUser.email,
          name: googleUser.name ?? '',
          picture: googleUser.picture,
          given_name: googleUser.given_name,
          family_name: googleUser.family_name,
        },
        roleHint,
        action,
      );

      // Firmamos token y redirigimos al front
      const accessToken = this.jwtService.sign({
        id: (user as any).id,
        email: (user as any).email,
        role: (user as any).role,
      });

      const redirectUrl =
        `${FRONT_URL}/oauth/success?token=${encodeURIComponent(accessToken)}` +
        (next ? `&next=${encodeURIComponent(next)}` : '');
      return res.redirect(redirectUrl);

    } catch (err: any) {
      // ✅ Detectar “cuenta Google no registrada” y redirigir al front, en vez de 400 JSON
      const status = err?.status ?? err?.statusCode;
      const msg = String(err?.message || '').toLowerCase();
      const looksUnregistered =
        status === 400 &&
        (msg.includes('no google account is registered') ||
         msg.includes('please sign up first'));

      if (looksUnregistered) {
        const q = new URLSearchParams({ oauth: 'unregistered' });
        if (googleUser?.email) q.set('email', googleUser.email);
        return res.redirect(`${FRONT_URL}/signin?${q.toString()}`);
      }

      // Otros errores → relanzar (o redirigir a una página de error si preferís)
      throw err;
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.userService.getUserById(req.user.id);
  }
    // 🧪 Diagnóstico: verifica manualmente el token del header Authorization
  // NO usa guard (así vemos si el secret coincide o si el token está vencido).
  @Get('debug-token')
  debugToken(@Req() req: any) {
    try {
      const auth: string = req.headers?.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';

      if (!token) {
        return { ok: false, error: 'Falta Authorization: Bearer <token>' };
      }

      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'dev-secret',
      });

      // Log útil
      console.log('AUTH /debug-token → payload =', payload);

      return { ok: true, payload };
    } catch (e: any) {
      console.error('AUTH /debug-token ERROR:', e?.message || e);
      return { ok: false, error: e?.message || String(e) };
    }
  }

  // 🧪 (Opcional) Ver directamente qué te arma el guard 'jwt'
  @UseGuards(JwtAuthGuard)
  @Get('me-raw')
  meRaw(@Req() req: any) {
    console.log('AUTH /me-raw → req.user =', req.user);
    return req.user;
  }

}
