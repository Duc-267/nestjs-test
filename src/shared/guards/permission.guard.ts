import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Permission } from 'src/data/schema/permission.schema';
import { PERMISSIONS } from '../constants/constant';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    @Inject(Permission.name) private permissionModel: Model<Permission>,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const permissionsName: string[] = this.reflector.getAllAndOverride(PERMISSIONS, [
			context.getHandler(),
			context.getClass(),
		]);
    if (!permissionsName?.length) {
      return true;
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const permissionsModel = await this.permissionModel.findOne(
      { role: user.role },
    );
    const hasPermission = () =>
    permissionsModel?.permissions.some((permission) =>
        permissionsName.includes(permission),
      );
    
    if (user && user.role && hasPermission()) return true;
    else {
      throw new ForbiddenException('No permission');
    }
  }
}
