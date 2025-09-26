import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin',
    ),
    OrdersModule
  ],
})
export class AppModule {}
