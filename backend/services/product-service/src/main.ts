import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const serviceHost = config.get<string>('HOST', '0.0.0.0');
  const port = Number(config.get<string>('PORT') ?? 3001);
  const microserviceHost = config.get<string>('MS_HOST', serviceHost);
  const microservicePort = Number(config.get<string>('MS_PORT') ?? 3011);
  const allowedOrigins = (config.get<string>('CORS_ORIGIN') || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true,
  });

  // Add global request logging
  app.use((req: any, res: any, next: any) => {
    console.log(`[Product Service] ${req.method} ${req.url}`);
    next();
  });

  // Start TCP microservice listener for API Gateway
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: microserviceHost,
      port: microservicePort,
    },
  });

  await app.startAllMicroservices();

  await app.listen(port, serviceHost, () => {
    console.log(`Product service is running on port ${port}`);
    if (allowedOrigins.length) {
      console.log('CORS enabled for:', allowedOrigins.join(', '));
    }
  });
}
bootstrap();
