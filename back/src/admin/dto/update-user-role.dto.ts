import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['user', 'professional', 'admin'])
  role!: 'user' | 'professional' | 'admin';
}