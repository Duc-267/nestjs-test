import { Body, Controller, Get, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { BaseResponse } from 'src/shared/interfaces/base.response';
import { AuthRo } from './response-objects/auth.ro';
import { LoginDto } from './handlers/login/login.dto';
import { SignUpDto } from './handlers/sign-up/sign-up.dto';
import { RegisterRo } from './response-objects/register.ro';
import { SignUpCommand } from './handlers/sign-up/sign-up';
import { CommandBus } from '@nestjs/cqrs';
import { LoginCommand } from './handlers/login/login';
import { ExtractRequestInformationInterceptor } from 'src/shared/interceptors/extract-request-information.interceptor';
import { LogoutDto } from './handlers/logout/logout.dto';
import { LogoutCommand } from './handlers/logout/logout';

@Controller('auth')
export class AuthenticationController {
    constructor(
        private readonly commandBus: CommandBus,
    ) {}

    @Post('sign-up')
    public async signup(@Body() dto: SignUpDto): Promise<BaseResponse<RegisterRo>> {
        return this.commandBus.execute(new SignUpCommand(dto));
    }

    @Post('log-in')
    public async login(@Body() dto: LoginDto): Promise<BaseResponse<AuthRo>> {
        return this.commandBus.execute(new LoginCommand(dto));
    }

    @Post('log-out')
    public async logout(@Body() dto: LogoutDto): Promise<BaseResponse<any>> {
        return this.commandBus.execute(new LogoutCommand(dto));
    }

}
