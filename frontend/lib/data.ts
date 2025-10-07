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
    name: 'Xu Hướng Công Nghệ',
    description: 'Top gadget mới nhất cho tín đồ công nghệ.',
    href: '/inspiration/tech-trends',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    hint: 'modern electronic devices display',
  },
  {
    name: 'Trang Trí Nhà Cửa',
    description: 'Biến không gian sống thành showroom mơ ước.',
    href: '/inspiration/home-style',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    hint: 'modern home decor setup',
  },
  {
    name: 'Phong Cách Thời Trang',
    description: 'Mix & match outfit cho mọi dịp.',
    href: '/inspiration/fashion-lookbook',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    hint: 'fashion outfits laid flat',
  },
  {
    name: 'LifeStyle & Chăm Sóc',
    description: 'Gợi ý sản phẩm chăm sóc sức khỏe & làm đẹp tại nhà.',
    href: '/inspiration/lifestyle-care',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80',
    hint: 'beauty and lifestyle flatlay',
  },
];
