import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthenticationModule } from './authentication/authentication.module';
// import { SendEmailCommandHandler } from './email/commands/handlers/send-email.command-handler';
// import { EmailModule } from './email/email.module';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SeedModule } from 'src/shared/seed/seed.module';


@Module({
    imports: [
        CqrsModule,
        AuthenticationModule,
        UserModule,
        SeedModule,
        // EmailModule,
    ],
    controllers: [],
    providers: [
    ],
    exports: [],
})
export class FeatureModule {}
