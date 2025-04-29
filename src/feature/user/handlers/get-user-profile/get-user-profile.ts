import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { UserRo } from '../../response-objects/user.ro';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuditLogService } from 'src/feature/authentication/services/audit-log.service';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum } from 'src/shared/enums/queue.enum';
import { globalValue } from 'src/shared/global-settings';

export class GetUserProfileQuery {
  constructor(
    public readonly loggedUserId: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetUserProfileQuery)
export class GetUserProfileQueryHandler
  implements IQueryHandler<GetUserProfileQuery>
{
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(Query: GetUserProfileQuery): Promise<BaseResponse<UserRo>> {
    const { loggedUserId, userId } = Query;

    const user = await this.userModel.findOne({
      _id: userId,
    });

    if (!user) throw new NotFoundException('User not found!');

    const auditLog: AuditLogDto = {
      userId: loggedUserId,
      action: QueueJobNameEnum.VIEW_USER_PROFILE_ADMIN,
      endpoint: 'user/login',
    };
    await this.auditLogService.storeLog(
      auditLog,
      QueueJobNameEnum.VIEW_USER_PROFILE_ADMIN,
    );
    return new OkResponse({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
