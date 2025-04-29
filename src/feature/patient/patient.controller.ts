import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
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
import { UpdatePatientDto } from './handlers/update-patient-record/update-patient-record.dto';
import { UpdatePatientRecordCommand } from './handlers/update-patient-record/update-patient-record';

@Controller('patient')
@UseInterceptors(RefreshTokenInterceptor)
@UseGuards(AppCustomAuthGuard, PermissionGuard)
export class PatientController {
  constructor(
    private readonly queryBus: QueryBus,

    private readonly commandBus: CommandBus,
  ) {}

  @Permission([PermissionEnum.VIEW_PATIENT_PROFILE])
  @Get(':id')
  async getPatientProfile(
    @User() user: UserAttachment,
    @Param('id') userId: string,
  ): Promise<BaseResponse<UserRo>> {
    return this.queryBus.execute(new GetPatientProfileQuery(user.id, userId));
  }

  @Permission([PermissionEnum.VIEW_PATIENT_PROFILE])
  @Post()
  async updatePatientRecord(
    @Body() dto: UpdatePatientDto,
    @User() user: UserAttachment,
  ): Promise<BaseResponse<UserRo>> {
    return this.commandBus.execute(new UpdatePatientRecordCommand(user.id, dto));
  }
}
