import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from './models/product.model';
import { User } from './models/user.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel('Product') private readonly productModel: Model<Product>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async seed() {
    const productCount = await this.productModel.countDocuments();
    const adminCount = await this.userModel.countDocuments({ isAdmin: true });

    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await this.userModel.create({
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin',
        isAdmin: true,
      });
    }

    if (productCount > 0) {
      return;
    }

    const placeholder = (label: string) =>
      `https://placehold.co/900x600?text=${encodeURIComponent(label)}`;

    const products = [
      {
        name: 'Bàn Ăn Công Nghiệp',
        description:
          'Bàn ăn khung thép phủ sơn tĩnh điện, mặt gỗ công nghiệp chống ẩm – phù hợp cho nhà hàng đông khách.',
        price: 2499000,
        stock: 50,
        rating: 4.5,
        reviews: 18,
        features: [
          'Khung thép sơn tĩnh điện',
          'Mặt bàn veneer chống thấm',
          'Dễ tháo rời vận chuyển',
        ],
        images: [placeholder('Dining Set')],
        category: 'furniture',
        subcategory: 'tables',
      },
      {
        name: 'Ghế Quầy Bar Vintage',
        description:
          'Ghế quầy bar khung sắt sơn mờ, đệm da PU chống bám bẩn, phong cách retro.',
        price: 899000,
        stock: 100,
        rating: 4.7,
        reviews: 42,
        features: ['Chiều cao điều chỉnh', 'Đệm mút đàn hồi', 'Chân đế chống trượt'],
        images: [placeholder('Bar Chair')],
        category: 'furniture',
        subcategory: 'chairs',
      },
      {
        name: 'Đèn Thả Trần Industrial',
        description:
          'Bộ đèn treo 3 bóng kim loại, phủ sơn chống gỉ, dây điều chỉnh chiều cao.',
        price: 1299000,
        stock: 75,
        rating: 4.6,
        reviews: 31,
        features: ['Đui đèn E27 phổ biến', 'Dây điều chỉnh', 'Sơn tĩnh điện bền màu'],
        images: [placeholder('Pendant Light')],
        category: 'lighting',
        subcategory: 'pendant',
      },
      {
        name: 'Tủ Mát Cửa Kính 2 Cánh',
        description:
          'Tủ mát thanh lý phù hợp cửa hàng tiện lợi và nhà hàng, vận hành tiết kiệm điện.',
        price: 4499000,
        stock: 20,
        rating: 4.4,
        reviews: 26,
        features: ['Dung tích 500L', 'Kính hai lớp chống đọng sương', 'Bảo hành 6 tháng'],
        images: [placeholder('Display Cooler')],
        category: 'appliance',
        subcategory: 'cooler',
      },
      {
        name: 'Kệ Trang Trí Gỗ Tái Chế',
        description:
          'Kệ chữ A làm từ gỗ pallet tái sử dụng, phù hợp bày biện decor.',
        price: 1890000,
        stock: 40,
        rating: 4.8,
        reviews: 19,
        features: ['Gỗ thông xử lý chống mối mọt', 'Gấp gọn dễ vận chuyển', 'Tải trọng 25kg/tầng'],
        images: [placeholder('Decor Shelf')],
        category: 'decor',
        subcategory: 'shelf',
      },
    ];

    await this.productModel.insertMany(products);
  }
}
