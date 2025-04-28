import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/data/schema/user.schema';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { LogoutAllDto } from './logout-all.dto';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { globalValue } from 'src/shared/global-settings';

export class LogoutAllCommand {
  constructor(public readonly dto: LogoutAllDto) {}
}

@CommandHandler(LogoutAllCommand)
export class LogoutAllCommandHandler implements ICommandHandler<LogoutAllCommand> {
  constructor(
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
  ) {}

  async execute(command: LogoutAllCommand): Promise<BaseResponse<string>> {
    try {
      const { token } = command.dto;
      const session = await this.authSessionModel.findOne({
        accessToken: token,
      }).populate('user')
      if (
        !session ||
        session.status === AuthSessionStatusEnum.REVOKED ||
        session.ipAddress !== globalValue.ipAddress ||
        session.deviceInfo !== globalValue.deviceInfo
      ) {
        throw new NotFoundException('Session not found');
      }
      await this.authSessionModel.updateMany(
        { status: AuthSessionStatusEnum.REVOKED },
        { userId: new mongoose.Types.ObjectId(session.user.id) },
      );
      return new OkResponse('Logout successful');
    } catch (error) {
      throw error;
    }
  }
}
