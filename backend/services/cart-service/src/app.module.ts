import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url:
        process.env.MONGODB_URI ||
        'mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin',
      entities: [CartItem],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([CartItem]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class AppModule {}
