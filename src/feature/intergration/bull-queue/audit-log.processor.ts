import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { AuditLog } from 'src/data/schema/audit-log.schema';
import { QueueJobNameEnum, QueueNameEnum } from 'src/shared/enums/queue.enum';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';

@Processor(QueueNameEnum.AUDIT_LOG)
export class AuditLogProcessor extends WorkerHost {
    constructor(
        @Inject(AuditLog.name) private auditLogModel: Model<AuditLog>,
    ) {
        super();
    }

    async process(job: Job<AuditLogDto, any, string>, token?: string): Promise<any> {
        switch (job.name) {
            case QueueJobNameEnum.LOGIN:
            case QueueJobNameEnum.LOGOUT:
            case QueueJobNameEnum.GET_USER_PROFILE:
            case QueueJobNameEnum.LOGOUT_ALL:
            case QueueJobNameEnum.GET_USER_SESSION:
            case QueueJobNameEnum.GET_USER_SESSION_ADMIN:
            case QueueJobNameEnum.VIEW_USER_PROFILE_ADMIN:
                return await this.handleAuditLog(job.data);
            default:
                throw new Error('No job name match');
        }
    }

    async handleAuditLog(audit: AuditLogDto) {
        try {
            const newAuditLog = new this.auditLogModel({
                userId: audit.userId,
                action: audit.action,
                endpoint: audit.endpoint,
                ipAddress: audit.ipAddress,
                deviceInfo: audit.deviceInfo,
                timeStamp: new Date(audit.timeStamp ?? ''),
            });
            await newAuditLog.save();
            return newAuditLog;
        } catch (error) {
            throw error;
        }
    }
}
