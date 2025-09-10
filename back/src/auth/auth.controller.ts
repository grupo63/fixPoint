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


  // // ▼▼▼ Google OAuth
  // @Get('google')
  // @UseGuards(AuthGuard('google'))
  // @ApiOperation({
  //   summary: 'Login with Google',
  //   description: 'Redirects the user to Google OAuth login page.',
  // })
  // @ApiResponse({ status: 302, description: 'Redirects to Google login page.' })
  // async googleLogin() {
  //   // Passport redirige a Google automáticamente
  //   return;
  // }

  // @Get('google/callback')
  // @UseGuards(AuthGuard('google'))
  // @ApiOperation({
  //   summary: 'Google OAuth callback',
  //   description:
  //     'Handles the callback from Google, issues a JWT and redirects to the frontend.',
  // })
  // @ApiResponse({
  //   status: 302,
  //   description: 'Redirects to frontend with JWT token in query param.',
  // })
  // async googleCallback(@Req() req, @Res() res) {
  //   const token = await this.authService.issueJwtFromOAuth(req.user);
  //   return res.redirect(
  //     `${process.env.FRONT_URL}/oauth/success?token=${token}`,
  //   );
  // }
  // @Get('me')
  // @UseGuards(JwtAuthGuard)
  // getProfile(@Request() req) {
  //   return this.userService.getUserById(req.user.id);
  // }


