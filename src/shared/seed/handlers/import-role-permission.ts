import { ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { Inject, Logger } from '@nestjs/common';
import { Permission } from 'src/data/schema/permission.schema';
import { UserRoleEnum } from 'src/shared/enums/user-role.enum';

export class ImportRolePermissionCommand {
  constructor() {}
}

@CommandHandler(ImportRolePermissionCommand)
export class ImportRolePermissionCommandHandler implements ICommandHandler<ImportRolePermissionCommand> {
  constructor(@Inject(Permission.name) private permissionModel: Model<Permission>) {}

  async execute(command: ImportRolePermissionCommand): Promise<void> {
    const permissionList = await this.permissionModel.find({}).exec();
    if (permissionList.length > 0) {
      return;
    }
    const adminUserNew = new this.permissionModel({
      role: UserRoleEnum.ADMIN,
      permissions: [
        'view_own_profile',
        'view_own_sessions',
        'manage_users',
        'manage_sessions',
        'view_patient_profile',
      ],
    });

    const doctorUserNew = new this.permissionModel({
      role: UserRoleEnum.DOCTOR,
      permissions: [
        'view_own_profile',
        'view_own_sessions',
        'view_patient_profile',
      ],
    });

    const patientUserNew = new this.permissionModel({
      role: UserRoleEnum.PATIENT,
      permissions: [
        'view_own_profile',
        'view_own_sessions',
      ],
    });

    await Promise.all([
      adminUserNew.save(),
      doctorUserNew.save(),
      patientUserNew.save(),
    ]);
  }
}
