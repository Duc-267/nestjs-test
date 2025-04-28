import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/data/schema/user.schema';
import { AuthenticationService } from '../../services/authentication.service';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { LogoutDto } from './logout.dto';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { OkResponse } from 'src/shared/interfaces/ok.response';

export class LogoutCommand {
  constructor(public readonly dto: LogoutDto) {}
}

@CommandHandler(LogoutCommand)
export class LogoutCommandHandler implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
  ) {}

  async execute(command: LogoutCommand): Promise<BaseResponse<string>> {
    try {
      const { tokens } = command.dto;
      await this.authSessionModel.findOneAndUpdate(
        { accessToken: tokens },
        { status: AuthSessionStatusEnum.REVOKED }
      );
      return new OkResponse('Logout successful');
    } catch (error) {
      throw error;
    }
  }

}
