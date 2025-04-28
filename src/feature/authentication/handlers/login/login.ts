import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/data/schema/user.schema';
import * as bcrypt from 'bcrypt';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuthenticationService } from '../../services/authentication.service';
import { LoginDto } from './login.dto';
import { AuthSession } from 'src/data/schema/auth-session.schema';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { AuthRo } from '../../response-objects/auth.ro';
import { globalValue } from 'src/shared/global-settings';

export class LoginCommand {
  constructor(public readonly dto: LoginDto) {}
}

@CommandHandler(LoginCommand)
export class LoginCommandHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(AuthSession.name) private authSessionModel: Model<AuthSession>,
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
        this.authenticationService.generateTokenAndRefreshToken(user);

      await this.saveSessionInfo(
        user._id as string,
        token,
        refreshToken,
        globalValue.deviceInfo,
        globalValue.ipAddress,
      );
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
    deviceInfo?: string,
    ipAddress?: string,
  ): Promise<any> {
    const session = new this.authSessionModel({
      userId: new mongoose.Types.ObjectId(userId),
      accessToken,
      refreshToken,
      deviceInfo,
      ipAddress,
    });
    await session.save();
  }
}
