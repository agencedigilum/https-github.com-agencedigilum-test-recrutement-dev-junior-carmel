import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../auth/entities/auth.entity';


export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
