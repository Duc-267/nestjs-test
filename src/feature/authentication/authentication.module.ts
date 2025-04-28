import { Module, Scope } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationController } from './authentication.controller';
import { AppCustomAuthGuard } from '../../shared/guards/app-custom-auth.guard';
import { CommandHandlers } from './handlers';
import { Services } from './services';
import { SharedModule } from 'src/shared/shared.module';
import { DataModule } from 'src/data/data.module';
import { PermissionGuard } from 'src/shared/guards/permission.guard';
@Module({
  imports: [CqrsModule, DataModule, SharedModule, JwtModule.register({})],
  providers: [
    AppCustomAuthGuard,
    PermissionGuard,
    ...CommandHandlers,
    ...Services,
  ],
  controllers: [AuthenticationController],
  exports: [AppCustomAuthGuard, PermissionGuard, JwtModule, ...Services],
})
export class AuthenticationModule {}
