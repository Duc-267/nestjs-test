import { GetPatientProfileQueryHandler } from "./get-patient-profile/get-patient-profile";
import { UpdatePatientRecordCommandHandler } from "./update-patient-record/update-patient-record";

export const QueryHandlers = [GetPatientProfileQueryHandler];
export const CommandHandlers = [UpdatePatientRecordCommandHandler];
