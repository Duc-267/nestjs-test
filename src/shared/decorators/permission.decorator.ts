import { SetMetadata } from '@nestjs/common';
import { PermissionEnum } from '../enums/permission.enum';
import { PERMISSIONS } from '../constants/constant';

export const Permission = (roles: PermissionEnum[]) => SetMetadata(PERMISSIONS, roles);
