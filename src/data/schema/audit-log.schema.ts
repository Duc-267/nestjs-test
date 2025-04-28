import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class AuditLog extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: String, required: true })
    action: string;

    @Prop({ type: String, required: true })
    endpoint: string;

    @Prop({ type: String, required: true })
    ipAddress: string;

    @Prop({ type: String, required: true })
    deviceInfo: string;

    @Prop({ type: Date, default: Date.now })
    timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
