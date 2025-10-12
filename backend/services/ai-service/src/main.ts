import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = Number(process.env.PORT || 3008);
  const host = process.env.HOST || '0.0.0.0';

  const msPort = Number(process.env.MS_PORT || 3018);
  const msHost = process.env.MS_HOST || '0.0.0.0';

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: msHost,
      port: msPort,
    },
  });

  await app.startAllMicroservices();

  await app.listen(port, host, () => {
    console.log(`AI service listening on http://${host}:${port}`);
    console.log(`AI service microservice listening on tcp://${msHost}:${msPort}`);
  });
}

bootstrap();
