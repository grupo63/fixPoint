import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto, LoginUserDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates a new user in the database.',
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid data.' })
  async signUp(@Body() user: CreateUserDto) {
    return this.authService.signUp(user);
  }

  @Post('signin')
  @ApiOperation({
    summary: 'User login',
    description: 'Validates credentials and returns a JWT.',
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
}
