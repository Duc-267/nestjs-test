import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Seeder } from './seed';
import { CommandHandlers } from './handlers/index';
import { DataModule } from 'src/data/data.module';

@Module({
  imports: [CqrsModule, DataModule],
  providers: [Seeder, ...CommandHandlers],
})
export class SeedModule {}
