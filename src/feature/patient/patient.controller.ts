import {
  Controller,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { UserRo } from './response-objects/patient.ro';
import { RefreshTokenInterceptor } from 'src/shared/interceptors/refresh-token.interceptor';
import { AppCustomAuthGuard } from '../../shared/guards/app-custom-auth.guard';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { UserAttachment } from 'src/shared/interfaces/user-attachment';
import { User } from 'src/shared/decorators/user.decorator';
import { GetPatientProfileQuery } from './handlers/get-patient-profile/get-patient-profile';
import { Permission } from 'src/shared/decorators/permission.decorator';
import { PermissionEnum } from 'src/shared/enums/permission.enum';

@Controller('patient')
@UseInterceptors(RefreshTokenInterceptor)
@UseGuards(AppCustomAuthGuard, PermissionGuard)
export class PatientController {
  constructor(private readonly queryBus: QueryBus) {}

  @Permission([PermissionEnum.MANAGE_USERS])
  @Get(':id')
  async getPatientProfile(
    @User() user: UserAttachment,
    @Param('id') userId: string,
  ): Promise<BaseResponse<UserRo>> {
    return this.queryBus.execute(new GetPatientProfileQuery(user.id, userId));
  }
}
