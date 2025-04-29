import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginDto } from './login.dto';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { AuthRo } from '../../response-objects/auth.ro';
import { globalValue } from 'src/shared/global-settings';
import { AuthSessionStatusEnum } from 'src/shared/enums/auth-section-status.enum';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum, QueueNameEnum } from 'src/shared/enums/queue.enum';
import { AuditLogService } from '../../services/audit-log.service';
import Redis from 'ioredis';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
    private readonly auditLogService: AuditLogService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async execute(command: LoginCommand): Promise<BaseResponse<AuthRo>> {
    try {
      const { email, password } = command.dto;
      const user = await this.userModel.findOne(
        { email },
        {
          password: 1,
          email: 1,
          role: 1,
        },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordMatched = await user.checkPassword(password);
      if (!isPasswordMatched) {
        throw new BadRequestException('Invalid password');
      }
      const { token, refreshToken } =
        await this.authenticationService.generateTokenAndRefreshToken(user);

      await this.invalidateSession(
        user._id as string,
        globalValue.ipAddress,
        globalValue.deviceInfo,
      );
      await this.saveSessionInfo(
        user._id as string,
        token,
        refreshToken,
        globalValue.ipAddress,
        globalValue.deviceInfo,
      );
      const auditLog: AuditLogDto = {
        userId: user._id as string,
        action: QueueJobNameEnum.LOGIN,
        endpoint: 'auth/login'
      };
      await this.auditLogService.storeLog(auditLog, QueueJobNameEnum.LOGIN);
      return new OkResponse(
        this.authenticationService.mappingToResponseAuthRo(user, {
          token,
          refreshToken,
        }),
      );
    } catch (error) {
      throw error;
    }
  }

  private async saveSessionInfo(
    userId: string,
    accessToken: string,
    refreshToken: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<void> {
    const session = new this.authSessionModel({
      userId: new mongoose.Types.ObjectId(userId),
      accessToken,
      refreshToken,
      deviceInfo,
      ipAddress,
    });
    await session.save();
  }

  private async invalidateSession(
    userId: string,
    ipAddress?: string,
    deviceInfo?: string,
  ): Promise<void> {
    await this.authSessionModel.updateMany(
      {
        userId: new mongoose.Types.ObjectId(userId),
        ipAddress,
        deviceInfo,
      },
      { status: AuthSessionStatusEnum.REVOKED },
    );
  }
}
