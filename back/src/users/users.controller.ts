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
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDTO } from './dto/users.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { TemporaryRole } from './types/temporary-role';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(TemporaryRole.ADMIN)
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
  // @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() user: UpdateUserDTO,
  ) {
    return this.usersService.updateUser(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivate a user from the system by their unique ID.',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.deleteUser(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reactivate user',
    description: 'Reactivate a previously deactivated user by their unique ID.',
  })
  @UseGuards(JwtAuthGuard)
  @Patch(':id/reactivate')
  reactivateUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.reactivateUser(id);
  }
}
