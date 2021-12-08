import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { CustomExceptionFilter } from './infra/filters/custom_filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
      stopAtFirstError: true,
    }),
  );
  app.useGlobalFilters(new CustomExceptionFilter());
  await app.listen(3000);
}
bootstrap();
