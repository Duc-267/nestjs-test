import { Module, Scope } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationController } from './authentication.controller';
import { AppCustomAuthGuard } from '../../shared/guards/app-custom-auth.guard';
import { CommandHandlers } from './handlers';
import { Services } from './services';
import { SharedModule } from 'src/shared/shared.module';
import { DataModule } from 'src/data/data.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ExtractRequestInformationInterceptor } from 'src/shared/interceptors/extract-request-information.interceptor';

@Module({
  imports: [
    CqrsModule,
    DataModule,
    SharedModule,
    JwtModule.register({
      signOptions: {
        expiresIn: process.env.TOKEN_EXPIRED,
      },
    }),
  ],
  providers: [
    AppCustomAuthGuard,
    ...CommandHandlers,
    ...Services,
  ],
  controllers: [AuthenticationController],
  exports: [AppCustomAuthGuard, JwtModule, ...Services],
})
export class AuthenticationModule {}
