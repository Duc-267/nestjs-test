import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PermissionEnum } from 'src/shared/enums/permission.enum';
import { UserRoleEnum } from 'src/shared/enums/user-role.enum';

@Schema()
export class Permission extends Document {
    @Prop({ type: String })
    role: UserRoleEnum;

    @Prop({ type: [String]})
    permissions: PermissionEnum[];
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
