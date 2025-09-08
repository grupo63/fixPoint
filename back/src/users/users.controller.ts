import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  Put,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dto/users.dto';
// import { CreateUserDTO } from './dto/createUser.dto';
// import { LoginUserDto } from './dto/signIn.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all users with pagination',
    description:
      'Retrieve a paginated list of users. You can specify the page number and the number of users per page using query parameters.',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  getUsers(@Query('page') page: number, @Query('limit') limit: number) {
    if (page && limit)
      return this.usersService.getUsers(Number(page), Number(limit));

    return this.usersService.getUsers(1, 10);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get one user by ID',
    description: 'Retrieve a single user by their unique ID.',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.getUserById(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user information',
    description: 'Update the details of an existing user by their ID.',
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() user: UpdateUserDTO,
  ) {
    return this.usersService.updateUser(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete a user',
    description: 'Delete a user from the system by their unique ID.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }
}
