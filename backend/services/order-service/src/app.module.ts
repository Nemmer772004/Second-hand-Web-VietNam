import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './orders/entities/order.entity';
import { OrdersModule } from './orders/orders.module';
import { HealthController } from './health.controller';

const resolveBool = (value: string | undefined, fallback = false) => {
  if (value == null) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('ORDER_PG_HOST') || config.get<string>('DB_HOST') || 'localhost',
        port: Number(config.get<string>('ORDER_PG_PORT') || config.get<string>('DB_PORT') || 5432),
        username:
          config.get<string>('ORDER_PG_USERNAME') || config.get<string>('DB_USERNAME') || 'nemmer',
        password:
          config.get<string>('ORDER_PG_PASSWORD') || config.get<string>('DB_PASSWORD') || 'nemmer',
        database: config.get<string>('ORDER_PG_DB') || config.get<string>('DB_NAME') || 'secondhand_ai',
        synchronize: resolveBool(config.get<string>('ORDER_PG_SYNC'), true),
        logging: resolveBool(config.get<string>('ORDER_PG_LOGGING')),
        ssl: resolveBool(config.get<string>('ORDER_PG_SSL')),
        entities: [OrderEntity],
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ||
          'mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin',
      }),
      inject: [ConfigService],
    }),
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
