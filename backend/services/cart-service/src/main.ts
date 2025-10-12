import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  });

  const msHost = process.env.MS_HOST || '0.0.0.0';
  const msPort = Number(process.env.MS_PORT || 3017);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: msHost,
      port: msPort,
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.PORT || 3007);
  await app.listen(port, '0.0.0.0', () => {
    console.log(`Cart service is running on port ${port}`);
    console.log(`Cart microservice listening on tcp://${msHost}:${msPort}`);
  });
}

bootstrap();
