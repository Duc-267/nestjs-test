import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { LogoutDto } from './logout.dto';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { globalValue } from 'src/shared/global-settings';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum } from 'src/shared/enums/queue.enum';
import { AuditLogService } from '../../services/audit-log.service';

export class LogoutCommand {
  constructor(
    public readonly loggedUserId: string,
    public readonly sessionId?: string,
    public readonly dto?: LogoutDto,
  ) {}
}

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(command: LogoutCommand): Promise<BaseResponse<string>> {
    try {
      const { token } = command.dto  || {}     
      const { loggedUserId, sessionId } = command;
      let session: AuthSession | null =  null
      if (sessionId) {
        session = await this.authSessionModel.findOne({
          _id: sessionId,
          user: loggedUserId,
          status: AuthSessionStatusEnum.ACTIVE,
        });
      } else {
        session = await this.authSessionModel.findOne({
          user: loggedUserId,
          refreshToken: token,
          status: AuthSessionStatusEnum.ACTIVE,
        });
      }
      if (
        !session ||
        session?.status === AuthSessionStatusEnum.REVOKED ||
        session?.ipAddress !== globalValue.ipAddress ||
        session?.deviceInfo !== globalValue.deviceInfo
      ) {
        throw new NotFoundException('Session not found');
      }
      await this.authSessionModel.updateOne(
        { _id: new mongoose.Types.ObjectId(session._id as string) },
        { status: AuthSessionStatusEnum.REVOKED },
      );
      const auditLog: AuditLogDto = {
        userId: loggedUserId,
        action: QueueJobNameEnum.LOGOUT,
        endpoint: 'auth/logout',
      };
      await this.auditLogService.storeLog(auditLog, QueueJobNameEnum.LOGIN);
      return new OkResponse('Logout successful');
    } catch (error) {
      throw error;
    }
  }
}
