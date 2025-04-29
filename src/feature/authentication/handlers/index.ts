import { GetUserProfileQueryHandler } from './get-user-profile/get-user-profile';
import { GetUserSessionQueryHandler } from './get-user-session/get-user-session';
import { LoginCommandHandler } from './login/login';
import { LogoutAllCommandHandler } from './logout-all/logout-all';
import { LogoutCommandHandler } from './logout/logout';
import { RefreshTokenCommandHandler } from './refresh-token/refresh-token';
import { SignUpCommandHandler } from './sign-up/sign-up';

export const CommandHandlers = [
  LoginCommandHandler,
  SignUpCommandHandler,
  LogoutCommandHandler,
  LogoutAllCommandHandler,
  GetUserProfileQueryHandler,
  GetUserSessionQueryHandler,
  RefreshTokenCommandHandler
];
