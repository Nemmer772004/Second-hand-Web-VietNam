import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3002, '0.0.0.0', () => {
    console.log('Category service is running on port 3002');
  });
}
bootstrap();
