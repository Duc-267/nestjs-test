import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { CustomHttpExceptionFilter } from './shared/filters/custom-http-exception.filter';
import { CustomValidationPipe } from './shared/pipes/validation.pipe';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ExtractRequestInformationInterceptor } from './shared/interceptors/extract-request-information.interceptor';
import { Seeder } from './shared/seed/seed';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const appVersion = `/api/${process.env.API_VERSION}`;

  app.useGlobalPipes(new CustomValidationPipe());
  app.useGlobalFilters(new CustomHttpExceptionFilter());
  app.useGlobalInterceptors(new ExtractRequestInformationInterceptor());
  app.setGlobalPrefix(appVersion);
  await app.listen(process.env.PORT || 3000, () => {
    Logger.log('App running at port ' + process.env.PORT || 3000),
    Logger.log(`App version: ${appVersion}`);
  });

  const seeder = app.get(Seeder);
  seeder
      .importDataDefault()
      .then(() => {
          Logger.log('Seeder default completed');
      })
      .catch(() => {
          Logger.error('Seeder default failed');
      })
      .finally(() => {
          Logger.log('Seeder default finish');
      });
}
bootstrap();
