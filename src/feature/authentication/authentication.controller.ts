import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { AuthRo } from './response-objects/auth.ro';
import { LoginDto } from './handlers/login/login.dto';
import { SignUpDto } from './handlers/sign-up/sign-up.dto';
import { RegisterRo } from './response-objects/register.ro';
import { SignUpCommand } from './handlers/sign-up/sign-up';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from './handlers/login/login';
import { ExtractRequestInformationInterceptor } from 'src/shared/interceptors/extract-request-information.interceptor';
import { LogoutDto } from './handlers/logout/logout.dto';
import { LogoutCommand } from './handlers/logout/logout';
import { User } from 'src/shared/decorators/user.decorator';
import { UserAttachment } from 'src/shared/interfaces/user-attachment';
import { GetUserProfileQuery } from './handlers/get-user-profile/get-user-profile';
import { UserRo } from './response-objects/user.ro';
import { Permission } from 'src/shared/decorators/permission.decorator';
import { PermissionEnum } from 'src/shared/enums/permission.enum';
import { RefreshTokenInterceptor } from 'src/shared/interceptors/refresh-token.interceptor';
import { AppCustomAuthGuard } from 'src/shared/guards/app-custom-auth.guard';
import { PermissionGuard } from 'src/shared/guards/permission.guard';

@Controller('auth')
export class AuthenticationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('sign-up')
  public async signup(
    @Body() dto: SignUpDto,
  ): Promise<BaseResponse<RegisterRo>> {
    return this.commandBus.execute(new SignUpCommand(dto));
  }

  @Post('login')
  public async login(@Body() dto: LoginDto): Promise<BaseResponse<AuthRo>> {
    return this.commandBus.execute(new LoginCommand(dto));
  }

  @Post('logout')
  public async logout(@Body() dto: LogoutDto): Promise<BaseResponse<any>> {
    return this.commandBus.execute(new LogoutCommand(dto));
  }

  @Post('logout-all')
  public async logoutAll(@Body() dto: LogoutDto): Promise<BaseResponse<any>> {
    return this.commandBus.execute(new LogoutCommand(dto));
  }

  @Permission([PermissionEnum.VIEW_OWN_PROFILE])
  @UseInterceptors(RefreshTokenInterceptor)
  @UseGuards(AppCustomAuthGuard, PermissionGuard)
  @Get('profile')
  async getUserProfile(
    @User() loggedUser: UserAttachment,
  ): Promise<BaseResponse<UserRo>> {
    return this.queryBus.execute(new GetUserProfileQuery(loggedUser.id));
  }

  @Permission([PermissionEnum.VIEW_OWN_SESSIONS])
  @UseInterceptors(RefreshTokenInterceptor)
  @UseGuards(AppCustomAuthGuard, PermissionGuard)
  @Get('sessions')
  async getUserProfile(
    @User() loggedUser: UserAttachment,
  ): Promise<BaseResponse<UserRo>> {
    return this.queryBus.execute(new GetUserProfileQuery(loggedUser.id));
  }
}
