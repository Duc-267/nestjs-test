import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CommandHandlers, QueryHandlers } from './handlers';
import { PatientController } from './patient.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { HttpModule } from '@nestjs/axios';
import { SharedModule } from 'src/shared/shared.module';
import { DataModule } from 'src/data/data.module';

@Module({
    imports: [CqrsModule, SharedModule, DataModule, AuthenticationModule, HttpModule],
    providers: [...QueryHandlers, ...CommandHandlers],
    controllers: [PatientController],
})
export class PatientModule {}
