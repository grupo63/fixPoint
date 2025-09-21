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
import { JwtAuthGuard } from '../auth/guards/auth.guards';
import { RolesGuard } from '../auth/guards/roles.guards';
import { Roles } from './roles.decorator';
import { AdminListQueryDto } from './dto/list-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
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
  @ApiOperation({ summary: 'List users (search, status filter & pagination)' })
  @ApiQuery({ name: 'q', required: false, description: 'Free text search on email, firstName, lastName' })
  @ApiQuery({ name: 'status', required: false, enum: ['all', 'active', 'inactive'], description: 'Default: all' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default 10)' })
  async listUsers(@Query() dto: AdminListQueryDto) {
    return this.svc.listUsers(
      dto.q,
      dto.status ?? 'all',
      dto.page,
      dto.limit,
    );
  }

  @Get('users/stats')
  @ApiOperation({ summary: 'Users stats for simple charts + latest services & tops' })
  @ApiOkResponse({
    description:
      'Active vs inactive + new users per day (last 14 days) + latestServices + topProfessionals + topUsersNonProfessionals',
    schema: {
      example: {
        distribution: { total: 120, active: 95, inactive: 25 },
        createdLast14d: [
          { day: '2025-09-01', count: 3 },
          { day: '2025-09-02', count: 7 },
        ],
        latestServices: [
          {
            reservationId: 'c6b6c0c8-6e2d-4b7f-9d75-6c2f7b3d0a11',
            status: 'CONFIRMED',
            lastReviewDate: '2025-09-14T16:40:00.000Z',
            user: { id: 'u-uuid', email: 'ana@example.com' },
            professional: { id: 'p-uuid', fullName: 'Juan Pérez', speciality: 'Plomería' },
          },
        ],
        topProfessionals: [
          { id: 'p-uuid', fullName: 'Juan Pérez', speciality: 'Electricista', avgRate: 4.92, reviews: 143 },
        ],
        topUsersNonProfessionals: [
          { userId: 'u-uuid', fullName: 'Ana Gómez', confirmedRequests: 72 },
        ],
      },
    },
  })
  async usersStats() {
    return this.svc.usersStats();
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
      makeAdmin: { summary: 'Promote to admin', value: { role: 'admin' } },
      makeProfessional: { summary: 'Set as professional', value: { role: 'professional' } },
      makeUser: { summary: 'Demote to user', value: { role: 'user' } },
    },
  })
  async setUserRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    return this.svc.setUserRole(id, body.role as any);
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