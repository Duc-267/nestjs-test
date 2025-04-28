import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { DataModule } from 'src/data/data.module';

@Module({
  imports: [CqrsModule, DataModule, JwtModule.register({})],
  providers: [],
  exports: [],
})
export class SharedModule {}
