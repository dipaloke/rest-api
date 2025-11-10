import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { AllExceptionFilter } from './all-exception.filter';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);

  app.useGlobalFilters(new AllExceptionFilter(httpAdapter));

  app.enableCors({
    origin: 'http://localhost:8000', //  Only allow frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    // credentials: true, // Allow cookies / authentication headers
  });

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
