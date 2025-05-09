import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { UserRo } from '../../response-objects/user.ro';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum, QueueNameEnum } from 'src/shared/enums/queue.enum';
import { globalValue } from 'src/shared/global-settings';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditLogService } from '../../services/audit-log.service';

export class GetUserProfileQuery {
  constructor(public readonly loggedUserId: string) {}
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
    const { loggedUserId } = Query;

    const user = await this.userModel.findOne({
      _id: loggedUserId,
    });

    if (!user) throw new NotFoundException('User not found!');
    const auditLog: AuditLogDto = {
      userId: loggedUserId,
      action: QueueJobNameEnum.GET_USER_PROFILE,
      endpoint: 'auth/profile',
    };
    await this.auditLogService.storeLog(
      auditLog,
      QueueJobNameEnum.GET_USER_PROFILE,
    );
    return new OkResponse({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
