import { Connection } from 'mongoose';
import { DataConstants } from './data.constants';
import { User, UserSchema } from './schema/user.schema';
import { AuthSession, AuthSessionSchema } from './schema/auth-session.schema';
import { AuditLog, AuditLogSchema } from './schema/audit-log.schema';

export const modelProviders = [
    {
        provide: User.name,
        useFactory: (connection: Connection) => connection.model(User.name, UserSchema),
        inject: [DataConstants.dbToken],
    },
    {
        provide: AuthSession.name,
        useFactory: (connection: Connection) => connection.model(AuthSession.name, AuthSessionSchema),
        inject: [DataConstants.dbToken],
    },
    {
        provide: AuditLog.name,
        useFactory: (connection: Connection) => connection.model(AuditLog.name, AuditLogSchema),
        inject: [DataConstants.dbToken],
    },
];
