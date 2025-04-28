import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import mongoose, { Document, Types } from 'mongoose';
import { UserRoleEnum } from 'src/shared/enums/user-role.enum';
import { AuthSession } from './auth-session.schema';

export interface User {
    checkPassword(attempt: string): boolean;
}


@Schema()
export class User extends Document {
    
    @Prop({ unique: true, maxlength: 255 })
    email: string;

    @Prop()
    password: string;

    @Prop({ type: String, default: UserRoleEnum.PATIENT })
    role: UserRoleEnum;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: Date.now })
    updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<User>('save', function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    bcrypt.genSalt(10, (err, salt) => {
        if (err) return next();
        bcrypt.hash(this.password, salt, (hErr, hash) => {
            if (hErr) return next(hErr);
            this.password = hash;
            next();
        });
    });
});

UserSchema.methods.checkPassword = async function (attempt) {
    return bcrypt.compare(attempt, this.password);
};
