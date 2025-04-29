import {
    IsDate,
    IsNotEmpty,
    IsOptional,
    MaxLength,
} from 'class-validator';

export class UpdatePatientDto {
    @IsNotEmpty()
    patientId: string;

    @IsOptional()
    appointmentDate?: string;

    @IsNotEmpty()
    @MaxLength(20)
    diagnosis: string;

    @IsNotEmpty()
    @MaxLength(20)
    treatmentPlan: string;

    @IsNotEmpty()
    @MaxLength(20)
    medicationPrescribed: string;
}
