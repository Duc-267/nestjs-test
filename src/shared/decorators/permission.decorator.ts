import { SetMetadata } from '@nestjs/common';
import { UserRoleEnum } from '../enums/user-role.enum';

export const Permissions = (roles: UserRoleEnum[]) => SetMetadata('permissions', roles);
