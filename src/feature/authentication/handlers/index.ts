import { LoginCommandHandler } from "./login/login";
import { LogoutAllCommandHandler } from "./logout-all/logout-all";
import { LogoutCommandHandler } from "./logout/logout";
import { SignUpCommandHandler } from "./sign-up/sign-up";

export const CommandHandlers = [LoginCommandHandler, SignUpCommandHandler, LogoutCommandHandler, LogoutAllCommandHandler];
