import { Body, Controller, Get, Post, Req, UseGuards, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { LoginUserDto } from './dto/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'User registration', description: 'Creates a new user in the database.' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }

  @Post('signin')
  @ApiOperation({ summary: 'User login', description: 'Validates user credentials and returns a JWT.' })
  @ApiResponse({ status: 200, description: 'Login successful. Returns the JWT token.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  signIn(@Body() credentials: LoginUserDto) {
    const { email, password } = credentials;
    return this.authService.signIn(email, password);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Login with Google', description: 'Redirects the user to Google OAuth login page.' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page.' })
  // No hace falta que sea async ni que retorne nada
  googleLogin() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback', description: 'Handles the callback from Google, issues a JWT and redirects to the frontend.' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with JWT token in query param.' })
  @Redirect(undefined, 302)
  async googleCallback(@Req() req: any) {
    const token = await this.authService.issueJwtFromOAuth(req.user);
    const frontUrl = process.env.FRONT_URL ?? 'http://localhost:3000';
    return { url: `${frontUrl}/oauth/success?token=${token}` };
  }
}
