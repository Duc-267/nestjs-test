import { CommandBus } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ImportRolePermissionCommand } from './handlers/import-role-permission';
import { Permission } from 'src/data/schema/permission.schema';

const logger = new Logger('importDataDefault');

@Injectable()
export class Seeder {
    constructor(@Inject(Permission.name) private readonly userModel: Model<Permission>, private readonly commandBus: CommandBus) {}

    async importDataDefault(): Promise<void> {
        try {
            this.commandBus.execute(new ImportRolePermissionCommand());
        } catch (e) {
            logger.error(e + '');
        }
    }
}
