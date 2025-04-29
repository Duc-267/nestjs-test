import { Injectable } from '@nestjs/common';
import { QueueJobNameEnum, QueueNameEnum } from 'src/shared/enums/queue.enum';
import { Queue } from 'bullmq';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { InjectQueue } from '@nestjs/bullmq';
import { globalValue } from 'src/shared/global-settings';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectQueue(QueueNameEnum.AUDIT_LOG)
    private readonly auditLogQueue: Queue,
  ) {}

  async storeLog(
    auditLog: AuditLogDto,
    jobName: QueueJobNameEnum,
  ): Promise<void> {
    const log: AuditLogDto = {
      ...auditLog,
      ipAddress: globalValue.ipAddress ?? '',
      deviceInfo: globalValue.deviceInfo ?? '',
      timeStamp: new Date().toISOString(),
    };
    await this.auditLogQueue.add(jobName, log);
  }
}
