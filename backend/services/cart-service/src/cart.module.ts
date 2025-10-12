import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartMessageController } from './cart.message.controller';
import { CartService } from './cart.service';
import { Cart } from './entities/cart.entity';

const truthy = (value?: string) =>
  typeof value === 'string' && ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT') ?? 5432),
        username: config.get<string>('DB_USERNAME', 'nemmer'),
        password: config.get<string>('DB_PASSWORD', 'nemmer'),
        database: config.get<string>('DB_NAME', 'studio_cart'),
        entities: [Cart],
        synchronize: truthy(config.get<string>('TYPEORM_SYNC') ?? 'true'),
        logging: truthy(config.get<string>('TYPEORM_LOGGING') ?? 'false'),
      }),
    }),
    TypeOrmModule.forFeature([Cart]),
    ClientsModule.registerAsync([
      {
        name: 'PRODUCT_SERVICE',
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('PRODUCT_SERVICE_HOST', 'localhost'),
            port: Number(
              config.get<string>('PRODUCT_SERVICE_MS_PORT') ??
                config.get<string>('PRODUCT_SERVICE_TCP_PORT') ??
                config.get<string>('PRODUCT_SERVICE_PORT') ??
                3011,
            ),
          },
        }),
      },
    ]),
  ],
  controllers: [CartController, CartMessageController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
