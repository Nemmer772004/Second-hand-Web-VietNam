export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: 'do-dien-lanh' | 'do-nha-hang' | 'do-van-phong' | 'do-gia-dinh';
  images: string[];
  isNew: boolean; // Dùng để chỉ sản phẩm mới về
  hint: string;
  description: string;
  specs: { [key: string]: string };
  status: 'Còn Hàng' | 'Hết Hàng';
  condition: 'Đã Kiểm Tra' | 'Mới 95%' | 'Bảo Hành 3 Tháng';
};

export type InspirationCategory = {
  name: string;
  description: string;
  href: string;
  image: string;
  hint: string;
};

export type HeroSlide = {
  title: string;
  subtitle: string;
  image: string;
  link: string;
  cta: string;
  alt: string;
  hint: string;
}

export const heroSlides: HeroSlide[] = [
  {
    title: "Thu Mua Đồ Cũ Giá Cao",
    subtitle: "Thanh lý đồ cũ, thiết bị nhà hàng, điện lạnh với giá tốt nhất thị trường. Tiết kiệm đến 50% khi mua đồ đã qua sử dụng!",
    image: "https://picsum.photos/seed/hero1/1920/1080",
    link: "/services/thu-mua",
    cta: "Yêu Cầu Thu Mua Ngay",
    alt: "Một kho chứa đầy đồ điện lạnh và nhà hàng cũ",
    hint: "used restaurant equipment"
  },
  {
    title: "Setup Nhà Hàng Tiết Kiệm",
    subtitle: "Cung cấp trọn gói thiết bị, bàn ghế nhà hàng, quán ăn đã qua sử dụng với chất lượng đảm bảo và chi phí tối ưu.",
    image: "https://picsum.photos/seed/hero2/1920/1080",
    link: "/services/setup-nha-hang",
    cta: "Xem Các Gói Setup",
    alt: "Không gian một nhà hàng được trang bị bàn ghế và thiết bị cũ",
    hint: "restaurant interior"
  }
];

export const productCategories = [
  { name: 'Đồ Điện Lạnh Cũ', href: '/products?category=do-dien-lanh', key: 'do-dien-lanh' },
  { name: 'Đồ Nhà Hàng Cũ', href: '/products?category=do-nha-hang', key: 'do-nha-hang' },
  { name: 'Đồ Văn Phòng Cũ', href: '/products?category=do-van-phong', key: 'do-van-phong' },
  { name: 'Đồ Gia Đình Cũ', href: '/products?category=do-gia-dinh', key: 'do-gia-dinh' },
];

export const products: Product[] = [
  {
    id: 'tu-lanh-cong-nghiep-samsung',
    name: 'Tủ Lạnh Công Nghiệp Cũ Samsung Side-by-Side',
    price: 5400000,
    originalPrice: 7500000,
    rating: 4.7,
    reviewCount: 20,
    category: 'do-dien-lanh',
    images: ['https://picsum.photos/seed/p1/800/800', 'https://picsum.photos/seed/p1a/800/800', 'https://picsum.photos/seed/p1b/800/800'],
    isNew: true,
    hint: 'tủ lạnh công nghiệp',
    description: "Tủ lạnh công nghiệp Samsung side-by-side cũ, dung tích lớn, phù hợp cho nhà hàng, quán ăn. Đã được kiểm tra kỹ thuật, làm lạnh nhanh và ổn định. Vỏ ngoài bằng thép không gỉ, có vài vết xước nhỏ không ảnh hưởng đến hoạt động.",
    specs: { 'Kích thước': 'D865 x W430 x H840 mm', 'Chất liệu': 'Thép không gỉ', 'Mã SP': '3*93250', 'Dung tích': '800L' },
    status: 'Còn Hàng',
    condition: 'Bảo Hành 3 Tháng'
  },
  {
    id: 'tu-dong-cong-nghiep',
    name: 'Tủ Đông Công Nghiệp Alaska Cũ',
    price: 2500000,
    rating: 4.5,
    reviewCount: 35,
    category: 'do-dien-lanh',
    images: ['https://picsum.photos/seed/p2/800/800', 'https://picsum.photos/seed/p2a/800/800', 'https://picsum.photos/seed/p2b/800/800'],
    isNew: false,
    hint: 'tủ đông công nghiệp',
    description: "Tủ đông công nghiệp Alaska dung tích 400L, lý tưởng để trữ đông thực phẩm số lượng lớn. Hiệu suất làm đông sâu, tiết kiệm điện. Sản phẩm đã được vệ sinh và kiểm tra gas, hoạt động tốt.",
    specs: { 'Kích thước': 'R: 120cm, S: 60cm, C: 85cm', 'Chất liệu': 'Tôn sơn tĩnh điện', 'Mã SP': 'TD-AK-002', 'Dung tích': '400L' },
    status: 'Còn Hàng',
    condition: 'Đã Kiểm Tra'
  },
  {
    id: 'ban-ghe-van-phong-cu',
    name: 'Bộ Bàn Ghế Văn Phòng Cũ Hòa Phát',
    price: 1200000,
    originalPrice: 2500000,
    rating: 4.8,
    reviewCount: 112,
    category: 'do-van-phong',
    images: ['https://picsum.photos/seed/p3/800/800', 'https://picsum.photos/seed/p3a/800/800', 'https://picsum.photos/seed/p3b/800/800'],
    isNew: false,
    hint: 'bàn ghế văn phòng',
    description: "Bộ bàn làm việc và ghế xoay văn phòng của Hòa Phát. Bàn gỗ công nghiệp chắc chắn, mặt bàn có vài vết xước nhẹ. Ghế xoay bọc lưới thoáng khí, còn hoạt động tốt. Thích hợp cho setup văn phòng tiết kiệm.",
    specs: { 'Kích thước Bàn': '120cm x 60cm', 'Chất liệu': 'Gỗ công nghiệp, Vải lưới, Kim loại', 'Mã SP': 'VP-HP-003' },
    status: 'Còn Hàng',
    condition: 'Mới 95%'
  },
  {
    id: 'bep-gas-cong-nghiep-cu',
    name: 'Bếp Gas Công Nghiệp 2 Họng Cũ',
    price: 1800000,
    rating: 4.6,
    reviewCount: 41,
    category: 'do-nha-hang',
    images: ['https://picsum.photos/seed/p4/800/800', 'https://picsum.photos/seed/p4a/800/800', 'https://picsum.photos/seed/p4b/800/800'],
    isNew: true,
    hint: 'bếp gas công nghiệp',
    description: "Bếp gas công nghiệp 2 họng, lửa lớn, phù hợp cho bếp nhà hàng, quán ăn. Thân bếp bằng inox chắc chắn, dễ vệ sinh. Đã được kiểm tra hệ thống đánh lửa và van gas, đảm bảo an toàn.",
    specs: { 'Kích thước': 'R: 80cm, S: 70cm, C: 80cm', 'Chất liệu': 'Inox', 'Mã SP': 'BEP-004' },
    status: 'Còn Hàng',
    condition: 'Đã Kiểm Tra'
  },
  {
    id: 'tu-mat-trung-bay-cu',
    name: 'Tủ Mát Trưng Bày Sanaky Cũ',
    price: 4500000,
    rating: 4.9,
    reviewCount: 68,
    category: 'do-dien-lanh',
    images: ['https://picsum.photos/seed/p5/800/800', 'https://picsum.photos/seed/p5a/800/800', 'https://picsum.photos/seed/p5b/800/800'],
    isNew: false,
    hint: 'tủ mát trưng bày',
    description: "Tủ mát trưng bày nước ngọt, thực phẩm của Sanaky, dung tích 500L. Cửa kính 2 lớp chống đọng sương, đèn LED chiếu sáng. Hệ thống làm lạnh đã được bảo dưỡng, hoạt động hiệu quả.",
    specs: { 'Kích thước': 'R: 65cm, S: 60cm, C: 180cm', 'Chất liệu': 'Thép, Kính', 'Mã SP': 'TM-SNK-005', 'Dung tích': '500L' },
    status: 'Còn Hàng',
    condition: 'Bảo Hành 3 Tháng'
  },
  {
    id: 'ban-ghe-inox-nha-hang',
    name: 'Bộ Bàn Ghế Inox Nhà Hàng Cũ',
    price: 350000,
    rating: 4.4,
    reviewCount: 205,
    category: 'do-nha-hang',
    images: ['https://picsum.photos/seed/p6/800/800', 'https://picsum.photos/seed/p6a/800/800', 'https://picsum.photos/seed/p6b/800/800'],
    isNew: false,
    hint: 'bàn ghế inox',
    description: "Bộ bàn ăn inox (1 bàn, 4 ghế đôn) đã qua sử dụng. Chất liệu inox bền, dễ lau chùi, phù hợp cho quán ăn, nhà hàng bình dân. Số lượng lớn có sẵn.",
    specs: { 'Kích thước Bàn': '100cm x 60cm', 'Chất liệu': 'Inox', 'Mã SP': 'BG-INOX-006' },
    status: 'Còn Hàng',
    condition: 'Đã Kiểm Tra'
  },
];

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
]
