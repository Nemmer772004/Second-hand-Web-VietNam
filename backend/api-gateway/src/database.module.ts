import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProductSchema } from './models/product.model';
import { UserSchema } from './models/user.model';
import { CartSchema } from './models/cart.model';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Product', schema: ProductSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Cart', schema: CartSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}
