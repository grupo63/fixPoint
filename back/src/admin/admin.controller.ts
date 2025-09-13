import { Controller, Get, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listUsers(@Query() dto: AdminListQueryDto) {
    return this.svc.listUsers(dto.q, dto.page, dto.limit);
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async setUserRole(@Param('id') id: string, @Body() body: UpdateUserRoleDto) {
    return this.svc.setUserRole(id, body.role);
  }

  @Patch('users/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  async deactivate(@Param('id') id: string) {
    return this.svc.deactivateUser(id);
  }

  @Patch('users/:id/reactivate')
  @ApiOperation({ summary: 'Reactivate user' })
  async reactivate(@Param('id') id: string) {
    return this.svc.reactivateUser(id);
  }
}