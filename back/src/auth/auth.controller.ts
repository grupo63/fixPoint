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
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import type {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { GoogleAuthGuard } from './guards/google.guards';
import { JwtAuthGuard } from './guards/auth.guards';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates a new user in the database.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user as any);
  }

  @Post('signin')
  @ApiOperation({
    summary: 'User login',
    description: 'Validates user credentials and returns a JWT.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns the JWT token.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  signIn(@Body() credentials: LoginUserDto) {
    const { email, password } = credentials;
    return this.authService.signIn(email, password);
  }

  // ===== Google OAuth =====
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Login/Register with Google',
    description: 'Redirects the user to Google OAuth login page.',
  })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page.' })
  googleLogin(): any {
    return HttpStatus.OK;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Google OAuth callback',
    description:
      'Handles the callback from Google, creates account if action=register, and redirects to the frontend.',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend with JWT token in query param.',
  })
  async googleCallback(
    @Req() req: ExpressRequest,
    @Res() res: ExpressResponse,
  ) {
    type Role = 'user' | 'professional';

    let roleHint: Role | undefined = undefined;
    let action: 'login' | 'register' = 'login';
    let next = '/';

    try {
      if (typeof req.query.state === 'string') {
        const parsed = JSON.parse(req.query.state);
        if (parsed?.role === 'user' || parsed?.role === 'professional') {
          roleHint = parsed.role;
        }
        if (parsed?.action === 'register') action = 'register';
        if (parsed?.next) next = String(parsed.next);
      }
    } catch {
      const raw = req.query?.role as string | undefined;
      if (raw === 'user' || raw === 'professional') roleHint = raw;
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
      throw new BadRequestException(
        'Google profile incomplete (sin email o providerId)',
      );
    }

    // --- Login o Registro según action ---
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

    const accessToken = this.jwtService.sign({
      id: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    });

    // Redirigir al front
    const base = process.env.FRONT_URL || 'http://localhost:3000';
    const redirectUrl = `${base}/auth/google/callback?token=${encodeURIComponent(accessToken)}&next=${encodeURIComponent(next)}`;

    return res.redirect(redirectUrl);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.userService.getUserById(req.user.id);
  }
}
