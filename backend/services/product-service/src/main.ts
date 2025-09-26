import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:3005', // Admin frontend
      'http://localhost:9002', // Main frontend
      'http://localhost:4000', // API Gateway
      'http://api-gateway:4000' // Internal API Gateway
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: true
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
      host: process.env.HOST || '0.0.0.0',
      port: Number(process.env.MS_PORT || 3011),
    },
  });

  await app.startAllMicroservices();

  await app.listen(3001, '0.0.0.0', () => {
    console.log('Product service is running on port 3001');
    console.log('CORS enabled for:', process.env.CORS_ORIGIN || 'http://localhost:3005,http://localhost:9002');
  });
}
bootstrap();
