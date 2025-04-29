import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from 'mongoose';

@Schema()
export class PatientRecord extends Document {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
    patientId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: Date })
    appointmentDate?: Date;

    @Prop({ type: String, required: true })
    diagnosis: string;

    @Prop({ type: String, required: true })
    treatmentPlan: string;

    @Prop({ type: String, required: true })
    medicationPrescribed: string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const PatientRecordSchema = SchemaFactory.createForClass(PatientRecord);