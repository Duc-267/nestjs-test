import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { User } from './user.schema';

@Schema()
export class AuthSession extends Document {
   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, alias: 'userId' })
    user: User;

    @Prop({ required: true })
    accessToken: string;

    @Prop({ required: true })
    refreshToken: string;

    @Prop({ required: true })
    deviceInfo: string;

    @Prop({ required: true })
    ipAddress: string;

    @Prop({ enum: AuthSessionStatusEnum, default: AuthSessionStatusEnum.ACTIVE })
    status: AuthSessionStatusEnum;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
