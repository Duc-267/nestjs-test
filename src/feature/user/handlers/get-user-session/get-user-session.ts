import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { UserRo } from '../../response-objects/user.ro';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuditLogService } from 'src/feature/authentication/services/audit-log.service';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { ListSessionResponse } from '../../response-objects/list-session.ro';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum } from 'src/shared/enums/queue.enum';

export class GetUserSessionQuery {
  constructor(
    public readonly loggedUserId: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetUserSessionQuery)
export class GetUserSessionQueryHandler
  implements IQueryHandler<GetUserSessionQuery>
{
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,

    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(
    Query: GetUserSessionQuery,
  ): Promise<BaseResponse<ListSessionResponse>> {
    const { loggedUserId, userId } = Query;

    const user = await this.userModel.findOne({
      _id: userId,
    });

    if (!user) throw new NotFoundException('User not found!');

    const session = await this.authSessionModel.find({
      user: userId,
      status: AuthSessionStatusEnum.ACTIVE,
    });

    const auditLog: AuditLogDto = {
      userId: loggedUserId,
      action: QueueJobNameEnum.GET_USER_SESSION_ADMIN,
      endpoint: 'user/session',
    };
    await this.auditLogService.storeLog(
      auditLog,
      QueueJobNameEnum.GET_USER_SESSION_ADMIN,
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
