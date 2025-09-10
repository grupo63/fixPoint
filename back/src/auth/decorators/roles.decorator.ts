import { SetMetadata } from '@nestjs/common';
import { TemporaryRole } from 'src/users/types/temporary-role';

export const Roles = (...roles: TemporaryRole[]) => SetMetadata('roles', roles);
