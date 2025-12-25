import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/AllExceptionsFilter';
import { Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableCors();
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // kafka consumer
  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'processing-service',
        brokers: configService
          .get<string>('KAFKA_BROKERS', 'localhost:9092')
          .split(','),
      },
      consumer: {
        groupId: configService.get<string>(
          'KAFKA_CONSUMER_GROUP',
          'processing-service-consumer',
        ),
      },
    },
  });
  
  await app.startAllMicroservices();

  const port = configService.get<number>('PORT', 4000);
  await app.listen(port);
  console.log(`Process service running on http://localhost:${port}`);
}
bootstrap();
