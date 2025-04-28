import { Module } from '@nestjs/common';
import { modelProviders } from './model.provider';
import { dataProviders } from './data.provider';

@Module({
  providers: [...dataProviders, ...modelProviders],
  exports: [...dataProviders, ...modelProviders],
})
export class DataModule {
}
