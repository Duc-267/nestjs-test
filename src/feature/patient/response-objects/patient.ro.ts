import { ApiProperty } from '@nestjs/swagger';
import { UserRoleEnum } from 'src/shared/enums/user-role.enum';

export class UserRo {
    id: string;
    email: string;
    role: UserRoleEnum;
    patientRecords: PatientRo[];
}

export class PatientRo {
    appointmentDate?: string;
    diagnosis: string;
    treatmentPlan: string;
    medicationPrescribed: string;
}