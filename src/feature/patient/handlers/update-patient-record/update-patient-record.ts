import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { User } from 'src/data/schema/user.schema';
import { UpdatePatientDto } from './update-patient-record.dto';
import { Model } from 'mongoose';
import { AuditLogService } from 'src/feature/authentication/services/audit-log.service';
import { PatientRecord } from 'src/data/schema/patient-record.schema';

export class UpdatePatientRecordCommand {
  constructor(
    public readonly loggedUserId: string,
    public readonly dto: UpdatePatientDto,
  ) {}
}

@CommandHandler(UpdatePatientRecordCommand)
export class UpdatePatientRecordCommandHandler
  implements ICommandHandler<UpdatePatientRecordCommand>
{
  constructor(
    @Inject(User.name) private userModel: Model<User>,
    @Inject(PatientRecord.name)  private patientRecordModel: Model<PatientRecord>,
    private readonly auditLogService: AuditLogService,
  ) {}
  async execute(command: UpdatePatientRecordCommand):Promise<PatientRecord>{
    try {
      const { dto } = command;
    const {
      patientId,
      appointmentDate,
      diagnosis,
      treatmentPlan,
      medicationPrescribed,
    } = dto;

    const patient = this.userModel.findOne({ _id: patientId });

    if (!patient) throw new NotFoundException('Patient not found!');

    const patientRecord = await this.patientRecordModel.insertOne({
      patientId,
      appointmentDate,
      diagnosis,
      treatmentPlan,
      medicationPrescribed,
    });
    return patientRecord;
    } catch (error) {
      throw new NotFoundException('Patient not found!');
    }
  } 
}
