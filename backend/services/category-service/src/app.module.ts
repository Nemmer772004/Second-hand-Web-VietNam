import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
        'mongodb://admin:adminpassword@localhost:27017/luxhome?authSource=admin',
    ),
    CategoryModule,
  ],
})
export class AppModule {}
