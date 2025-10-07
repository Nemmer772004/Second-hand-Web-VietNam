import { heroSlides } from './hero-slides';

export type InspirationCategory = {
  name: string;
  description: string;
  href: string;
  image: string;
  hint: string;
};

export { heroSlides };

export const inspirationCategories: InspirationCategory[] = [
  {
    name: 'Setup Quán Ăn Nhỏ',
    description: 'Giải pháp tiết kiệm cho khởi đầu.',
    href: '/inspiration/small-restaurant',
    image: 'https://picsum.photos/seed/i1/600/400',
    hint: 'small restaurant setup',
  },
  {
    name: 'Tối Ưu Bếp Nhà Hàng',
    description: 'Bố trí bếp chuyên nghiệp, hiệu quả.',
    href: '/inspiration/kitchen-layout',
    image: 'https://picsum.photos/seed/i2/600/400',
    hint: 'restaurant kitchen',
  },
  {
    name: 'Quầy Bar Từ Đồ Tái Chế',
    description: 'Sáng tạo không gian độc đáo, cá tính.',
    href: '/inspiration/recycled-bar',
    image: 'https://picsum.photos/seed/i3/600/400',
    hint: 'recycled bar counter',
  },
  {
    name: 'Văn Phòng Hiện Đại & Tiết Kiệm',
    description: 'Tạo không gian làm việc chuyên nghiệp.',
    href: '/inspiration/office-setup',
    image: 'https://picsum.photos/seed/i4/600/400',
    hint: 'modern office',
  },
];
