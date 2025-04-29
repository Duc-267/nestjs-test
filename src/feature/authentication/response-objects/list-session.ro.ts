import { AuthSessionStatusEnum } from "src/shared/enums/auth-section-status.enum";

export class ListSessionRo {
    refreshToken?: string;
    deviceInfo?: string;
    ipAddress?: string;
    status?: AuthSessionStatusEnum;
    createdAt?: Date;
    updatedAt?: Date;
}

export class ListSessionResponse {
    sessions?: ListSessionRo[];
}