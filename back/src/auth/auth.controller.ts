import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/auth.guards';
import { UsersService } from 'src/users/users.service';
import type {
  Response as ExpressResponse,
  Request as ExpressRequest,
} from 'express';
import { GoogleAuthGuard } from './guards/google.guards';
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

  //Google
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Login with Google',
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
      'Handles the callback from Google, issues a JWT and redirects to the frontend.',
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

    const raw =
      (req.query?.state as string | undefined) ??
      (req.query?.role as string | undefined);

    const roleHint: Role | undefined =
      raw === 'user' || raw === 'professional' ? raw : undefined;

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
    );

    const accessToken = this.jwtService.sign({
      id: (user as any).id,
      email: (user as any).email,
      role: (user as any).role,
    });

    // 🔹 MODO DEBUG: si está activo, NO redirige; devuelve JSON para inspección
    const DEBUG = String(process.env.OAUTH_DEBUG ?? '').toLowerCase();
    const isDebug = DEBUG === '1' || DEBUG === 'true' || DEBUG === 'yes';

    if (isDebug) {
      console.log('[OAuth][DEBUG] mode:', (roleHint ? 'register' : 'login'));
      console.log('[OAuth][DEBUG] user:', (user as any).email, 'role:', (user as any).role);

      return res.status(200).json({
        ok: true,
        mode: roleHint ? 'register' : 'login',
        user: {
          id: (user as any).id,
          email: (user as any).email,
          role: (user as any).role,
        },
        accessToken,
      });
    }

    const base = process.env.FRONT_URL || 'http://localhost:3000';
    return res.redirect(`${base}/?token=${accessToken}`);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return this.userService.getUserById(req.user.id);
  }
}
