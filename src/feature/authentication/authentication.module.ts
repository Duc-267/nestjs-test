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
import { BullModule } from '@nestjs/bullmq';
import { AuditLogProcessor } from '../intergration/bull-queue/audit-log.processor';
import { QueueNameEnum, QueuePrefixEnum } from 'src/shared/enums/queue.enum';
import { RedisModule } from '@nestjs-modules/ioredis';
@Module({
  imports: [
    CqrsModule,
    DataModule,
    SharedModule,
    JwtModule.register({}),
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',     // Configure your Redis port
    }),
    BullModule.registerQueue({
      name: QueueNameEnum.AUDIT_LOG,
      prefix: QueuePrefixEnum.AUTHENTICATION,
    }),
    BullModule.registerQueue({
      name: QueueNameEnum.REFRESH_TOKEN_EXPIRY,
      prefix: QueuePrefixEnum.AUTHENTICATION,
    }),
  ],
  providers: [
    AppCustomAuthGuard,
    PermissionGuard,
    AuditLogProcessor,
    ...CommandHandlers,
    ...Services,
  ],
  controllers: [AuthenticationController],
  exports: [AppCustomAuthGuard, PermissionGuard, JwtModule, ...Services],
})
export class AuthenticationModule {}
