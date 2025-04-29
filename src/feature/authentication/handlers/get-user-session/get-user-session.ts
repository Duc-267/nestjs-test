import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum } from 'src/shared/enums/queue.enum';
import { globalValue } from 'src/shared/global-settings';
import { AuditLogService } from '../../services/audit-log.service';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { ListSessionResponse } from '../../response-objects/list-session.ro';

export class GetUserSessionQuery {
  constructor(public readonly loggedUserId: string) {}
}

@QueryHandler(GetUserSessionQuery)
export class GetUserSessionQueryHandler
  implements IQueryHandler<GetUserSessionQuery>
{
  constructor(
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(Query: GetUserSessionQuery): Promise<BaseResponse<ListSessionResponse>> {
    const { loggedUserId } = Query;

    const session = await this.authSessionModel.find({
      user: loggedUserId,
      status: AuthSessionStatusEnum.ACTIVE,
    });

    const auditLog: AuditLogDto = {
      userId: loggedUserId,
      action: QueueJobNameEnum.GET_USER_SESSION,
      endpoint: 'auth/session',
    };
    await this.auditLogService.storeLog(
      auditLog,
      QueueJobNameEnum.GET_USER_SESSION,
    );
    const sessionRo = session.map((session) => {
      return {
        refreshToken: session.refreshToken,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    });
    return new OkResponse({
      sessions: sessionRo,
    });
    }
}