import { GetUserProfileQuery, GetUserProfileQueryHandler } from './get-user-profile/get-user-profile';
import { GetUserSessionQueryHandler } from './get-user-session/get-user-session';

export const QueryHandlers = [GetUserProfileQuery, GetUserSessionQueryHandler, GetUserProfileQueryHandler];
export const CommandHandlers = [];
