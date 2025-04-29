export interface AuditLogDto {
    userId: string;
    action: string;
    endpoint: string;
    ipAddress?: string;
    deviceInfo?: string;
    timeStamp?: string;
}