import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:3005', // Admin frontend
      'http://localhost:9002', // Main frontend
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Force port 4000 for API Gateway
  const port = 4000;
  
  await app.listen(port, '0.0.0.0', () => {
    console.log(`API Gateway is running on port ${port}`);
  });
}
bootstrap();
