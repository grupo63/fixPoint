import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/auth.guards'; // SIN cambios en auth
import { AdminOnlyGuard } from './admin.guard';            // guard local
import { AdminListQueryDto } from './dto/list-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminOnlyGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Admin overview (basic counters)' })
  @ApiOkResponse({ description: 'OK' })
  async overview() {
    return this.svc.overview();
  }

  @Get('users')
  @ApiOperation({ summary: 'List users (search & pagination)' })
  @ApiQuery({ name: 'q', required: false, description: 'Free text search on email, firstName, lastName' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10)' })
  async listUsers(@Query() dto: AdminListQueryDto) {
    return this.svc.listUsers(dto.q, dto.page, dto.limit);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiBody({
    type: UpdateUserRoleDto,
    description: 'Payload to change the user role',
    examples: {
      makeAdmin: {
        summary: 'Promote to admin',
        value: { role: 'admin' },
      },
      makeProfessional: {
        summary: 'Set as professional',
        value: { role: 'professional' },
      },
      makeUser: {
        summary: 'Demote to user',
        value: { role: 'user' },
      },
    },
  })
  async setUserRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    return this.svc.setUserRole(id, body.role);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async deactivate(@Param('id') id: string) {
    return this.svc.deactivateUser(id);
  }

  @Patch('users/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate user' })
  @ApiParam({
    name: 'id',
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  async reactivate(@Param('id') id: string) {
    return this.svc.reactivateUser(id);
  }
}