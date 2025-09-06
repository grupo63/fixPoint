import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles_required';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
