import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin',
        retryAttempts: Number(configService.get<string>('MONGODB_RETRY_ATTEMPTS') ?? 3),
        retryDelay: Number(configService.get<string>('MONGODB_RETRY_DELAY_MS') ?? 1000),
      }),
      inject: [ConfigService],
    }),
    ProductModule,
  ],
})
export class AppModule {}
