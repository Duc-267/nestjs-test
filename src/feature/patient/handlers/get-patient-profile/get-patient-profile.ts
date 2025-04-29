import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Model } from 'mongoose';
import { UserRo } from '../../response-objects/patient.ro';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { User } from 'src/data/schema/user.schema';
import { OkResponse } from 'src/shared/interfaces/ok.response';
import { AuditLogService } from 'src/feature/authentication/services/audit-log.service';
import { AuditLogDto } from 'src/shared/interfaces/audit-log';
import { QueueJobNameEnum } from 'src/shared/enums/queue.enum';
import { PatientRecord } from 'src/data/schema/patient-record.schema';

export class GetPatientProfileQuery {
  constructor(
    public readonly loggedUserId: string,
    public readonly userId: string,
  ) {}
}

@QueryHandler(GetPatientProfileQuery)
export class GetPatientProfileQueryHandler
  implements IQueryHandler<GetPatientProfileQuery>
{
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(PatientRecord.name) private patientModel: Model<PatientRecord>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async execute(Query: GetPatientProfileQuery): Promise<BaseResponse<UserRo>> {
    const { loggedUserId, userId } = Query;

    const user = await this.userModel.findOne({
      _id: userId,
    });

    if (!user) throw new NotFoundException('User not found!');
    const patient = await this.patientModel.find({
      patientId: userId,
    });
    const auditLog: AuditLogDto = {
      userId: loggedUserId,
      action: QueueJobNameEnum.VIEW_PATIENT_PROFILE,
      endpoint: 'patient/:id',
    };
    await this.auditLogService.storeLog(
      auditLog,
      QueueJobNameEnum.VIEW_PATIENT_PROFILE,
    );
    return new OkResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      patientRecords: patient.map((patient) => {
        return {
          appointmentDate: (patient.appointmentDate)?.toString(),
          diagnosis: patient.diagnosis,
          treatmentPlan: patient.treatmentPlan,
          medicationPrescribed: patient.medicationPrescribed,
        };
      }),
    });
  }
}
