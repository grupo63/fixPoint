import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'New role to assign to the user',
    enum: ['user', 'professional', 'admin'],
    example: 'admin',
  })
  @IsIn(['user', 'professional', 'admin'])
  role!: 'user' | 'professional' | 'admin';
}