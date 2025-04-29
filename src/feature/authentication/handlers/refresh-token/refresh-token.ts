import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { AuthRo } from '../../response-objects/auth.ro';
import { globalValue } from 'src/shared/global-settings';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum, QueueNameEnum } from 'src/shared/enums/queue.enum';
import { AuditLogService } from '../../services/audit-log.service';
import { RefreshTokenDto } from './refresh-token.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtRo } from '../../response-objects/jwt.ro';

export class RefreshTokenCommand {
  constructor(
    public readonly dto: RefreshTokenDto,

    public readonly loggedUserId: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenCommandHandler
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<BaseResponse<JwtRo>> {
    try {
      const { dto, loggedUserId } = command;
      const { refreshToken } = dto;
      const user = await this.userModel.findOne({
        _id: loggedUserId,
      });
      if (!user) throw new NotFoundException('User not found!');
      await this.jwtService.verifyAsync(refreshToken, {
        secret: user.password,
      });
      const { token } = this.authenticationService.generateNewToken(user);
      await this.authSessionModel.updateOne(
        { refreshToken: refreshToken },
        { accessToken: token }
      );
      const auditLog: AuditLogDto = {
        userId: loggedUserId,
        action: QueueJobNameEnum.REFRESH_TOKEN,
        endpoint: 'auth/refresh',
      };
      await this.auditLogService.storeLog(
        auditLog,
        QueueJobNameEnum.REFRESH_TOKEN,
      );
      return new OkResponse({
        token: token,
        refreshToken: refreshToken,
      });
    } catch (error) {
      throw error;
    }
  }
}
