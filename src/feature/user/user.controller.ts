import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import {  QueryBus } from '@nestjs/cqrs';
import { UserRo } from './response-objects/user.ro';
import { RefreshTokenInterceptor } from 'src/shared/interceptors/refresh-token.interceptor';
import { AppCustomAuthGuard } from '../../shared/guards/app-custom-auth.guard';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { UserAttachment } from 'src/shared/interfaces/user-attachment';
import { User } from 'src/shared/decorators/user.decorator';
import { GetUserProfileQuery } from './handlers/get-user-profile';
import { Permission } from 'src/shared/decorators/permission.decorator';
import { PermissionEnum } from 'src/shared/enums/permission.enum';

@Controller('users')
@Permission([PermissionEnum.MANAGE_USERS])
@UseInterceptors(RefreshTokenInterceptor)
@UseGuards(AppCustomAuthGuard, PermissionGuard)
export class UserController {
    constructor(
        private readonly queryBus: QueryBus,
    ) {}

    @Get('profile')
    async getUserProfile(@User() loggedUser: UserAttachment): Promise<BaseResponse<UserRo>> {
        return this.queryBus.execute(new GetUserProfileQuery(loggedUser.id));
    }
}
