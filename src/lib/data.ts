export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: 'sofas' | 'chairs' | 'tables' | 'beds' | 'storage' | 'decor';
  images: string[];
  isNew: boolean;
  hint: string;
  description: string;
  specs: { [key: string]: string };
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
    title: "Thanh Lịch Trong Từng Chi Tiết",
    subtitle: "Khám phá bộ sưu tập ghế sofa thủ công mới của chúng tôi, được thiết kế cho cuộc sống hiện đại.",
    image: "https://picsum.photos/seed/hero1/1920/1080",
    link: "/products",
    cta: "Khám Phá Ghế Sofa",
    alt: "Một phòng khách hiện đại đẹp với một chiếc ghế sofa thời trang",
    hint: "phòng khách"
  },
  {
    title: "Sự Thoải Mái Vượt Thời Gian",
    subtitle: "Tạo ra một không gian bạn yêu thích với đồ nội thất kết hợp giữa hình thức và chức năng.",
    image: "https://picsum.photos/seed/hero2/1920/1080",
    link: "/products",
    cta: "Mua sắm bộ sưu tập",
    alt: "Một phòng ngủ ấm cúng với một chiếc giường thoải mái và đồ nội thất bằng gỗ",
    hint: "phòng ngủ ấm cúng"
  }
];

export const productCategories = [
  { name: 'Ghế Sofa', href: '/products?category=sofas', key: 'sofas' },
  { name: 'Ghế', href: '/products?category=chairs', key: 'chairs' },
  { name: 'Bàn', href: '/products?category=tables', key: 'tables' },
  { name: 'Giường', href: '/products?category=beds', key: 'beds' },
  { name: 'Tủ Kệ', href: '/products?category=storage', key: 'storage' },
  { name: 'Trang Trí', href: '/products?category=decor', key: 'decor' },
];

export const products: Product[] = [
  {
    id: 'velvet-dream-sofa',
    name: 'Sofa Nhung Mơ Mộng',
    price: 899.99,
    rating: 4.8,
    reviewCount: 124,
    category: 'sofas',
    images: ['https://picsum.photos/seed/p1/800/800', 'https://picsum.photos/seed/p1a/800/800', 'https://picsum.photos/seed/p1b/800/800'],
    isNew: true,
    hint: 'sofa nhung',
    description: "Tận hưởng sự thoải mái sang trọng của Sofa Nhung Mơ Mộng. Lớp bọc nhung sang trọng và chỗ ngồi sâu khiến nó trở thành trung tâm hoàn hảo cho bất kỳ phòng khách hiện đại nào. Khung gỗ chắc chắn đảm bảo độ bền, trong khi đệm mút mật độ cao cung cấp sự hỗ trợ đặc biệt. Có sẵn trong nhiều màu sắc phong phú để phù hợp với trang trí của bạn.",
    specs: { 'Kích thước': 'R: 220cm, S: 95cm, C: 85cm', 'Chất liệu': 'Nhung, Gỗ đặc, Mút mật độ cao', 'Mã SP': 'SF-VD-001' }
  },
  {
    id: 'oakwood-coffee-table',
    name: 'Bàn Cà Phê Gỗ Sồi',
    price: 249.99,
    rating: 4.7,
    reviewCount: 98,
    category: 'tables',
    images: ['https://picsum.photos/seed/p2/800/800', 'https://picsum.photos/seed/p2a/800/800', 'https://picsum.photos/seed/p2b/800/800'],
    isNew: false,
    hint: 'bàn gỗ sồi',
    description: "Mang vẻ đẹp thanh lịch tự nhiên vào không gian sống của bạn với Bàn Cà Phê Gỗ Sồi. Được chế tác từ gỗ sồi nguyên khối với lớp hoàn thiện vân gỗ tuyệt đẹp, chiếc bàn này kết hợp thiết kế tối giản với chức năng thực tế. Mặt trên rộng rãi và kệ dưới cung cấp không gian rộng rãi cho sách, tạp chí và đồ trang trí. Một món đồ vượt thời gian bổ sung cho mọi phong cách.",
    specs: { 'Kích thước': 'R: 120cm, S: 60cm, C: 45cm', 'Chất liệu': 'Gỗ sồi đặc', 'Mã SP': 'TB-OC-002' }
  },
  {
    id: 'scandi-armchair',
    name: 'Ghế Bành Scandi',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.9,
    reviewCount: 210,
    category: 'chairs',
    images: ['https://picsum.photos/seed/p3/800/800', 'https://picsum.photos/seed/p3a/800/800', 'https://picsum.photos/seed/p3b/800/800'],
    isNew: false,
    hint: 'ghế bành scandinavian',
    description: "Tận hưởng hygge với Ghế Bành Scandi. Với thiết kế tối giản, sạch sẽ với khung gỗ chắc chắn và lớp bọc vải có kết cấu thoải mái, chiếc ghế này là nơi hoàn hảo để thư giãn và nghỉ ngơi. Hình dáng công thái học của nó cung cấp sự hỗ trợ tuyệt vời, lý tưởng để đọc sách hoặc thưởng thức một tách cà phê.",
    specs: { 'Kích thước': 'R: 75cm, S: 80cm, C: 90cm', 'Chất liệu': 'Vải, Gỗ đặc', 'Mã SP': 'CH-SA-003' }
  },
  {
    id: 'minimalist-platform-bed',
    name: 'Giường Bục Tối Giản',
    price: 799.99,
    rating: 4.6,
    reviewCount: 75,
    category: 'beds',
    images: ['https://picsum.photos/seed/p4/800/800', 'https://picsum.photos/seed/p4a/800/800', 'https://picsum.photos/seed/p4b/800/800'],
    isNew: true,
    hint: 'giường bục',
    description: "Tạo ra một phòng ngủ thanh bình và gọn gàng với Giường Bục Tối Giản. Thiết kế thấp và những đường nét gọn gàng mang lại cảm giác yên tĩnh và tinh tế. Được làm từ gỗ có nguồn gốc bền vững, khung giường này cung cấp một nền tảng vững chắc và phong cách cho một giấc ngủ ngon.",
    specs: { 'Kích thước': 'Queen - R: 160cm, D: 200cm, C: 30cm', 'Chất liệu': 'Gỗ thông đặc', 'Mã SP': 'BD-MP-004' }
  },
  {
    id: 'industrial-bookshelf',
    name: 'Kệ Sách Công Nghiệp',
    price: 499.99,
    rating: 4.8,
    reviewCount: 150,
    category: 'storage',
    images: ['https://picsum.photos/seed/p5/800/800', 'https://picsum.photos/seed/p5a/800/800', 'https://picsum.photos/seed/p5b/800/800'],
    isNew: false,
    hint: 'kệ sách công nghiệp',
    description: "Trưng bày những cuốn sách và đồ trang trí yêu thích của bạn với Kệ Sách Công Nghiệp. Sự kết hợp giữa các kệ gỗ mộc mạc và khung kim loại chắc chắn tạo nên một vẻ ngoài táo bạo, hiện đại. Với năm kệ rộng rãi, nó cung cấp không gian lưu trữ và trưng bày rộng rãi cho bất kỳ căn phòng nào trong nhà bạn.",
    specs: { 'Kích thước': 'R: 100cm, S: 30cm, C: 180cm', 'Chất liệu': 'Gỗ tái chế, Thép', 'Mã SP': 'ST-IB-005' }
  },
  {
    id: 'terracotta-vase-set',
    name: 'Bộ Bình Gốm Terracotta',
    price: 79.99,
    rating: 4.9,
    reviewCount: 302,
    category: 'decor',
    images: ['https://picsum.photos/seed/p6/800/800', 'https://picsum.photos/seed/p6a/800/800', 'https://picsum.photos/seed/p6b/800/800'],
    isNew: true,
    hint: 'bình gốm terracotta',
    description: "Thêm một chút ấm áp của đất vào ngôi nhà của bạn với bộ ba bình gốm terracotta này. Mỗi chiếc bình có hình dạng độc đáo, được làm thủ công và lớp hoàn thiện mờ. Hoàn hảo để trưng bày hoa khô hoặc làm đồ trang trí độc lập, chúng mang lại vẻ quyến rũ tự nhiên, mộc mạc cho bất kỳ không gian nào.",
    specs: { 'Kích thước': 'Chiều cao khác nhau (15cm, 20cm, 25cm)', 'Chất liệu': 'Đất nung', 'Mã SP': 'DC-TV-006' }
  },
  {
    id: 'linen-accent-chair',
    name: 'Ghế Nhấn Vải Lanh',
    price: 299.99,
    rating: 4.5,
    reviewCount: 88,
    category: 'chairs',
    images: ['https://picsum.photos/seed/p7/800/800', 'https://picsum.photos/seed/p7a/800/800', 'https://picsum.photos/seed/p7b/800/800'],
    isNew: false,
    hint: 'ghế vải lanh',
    description: "Ghế Nhấn Vải Lanh là một món đồ đa năng giúp tăng thêm sự thoải mái và phong cách cho bất kỳ góc nào. Được bọc bằng vải lanh tự nhiên, thoáng khí, nó có thiết kế cổ điển với một chút hiện đại. Ghế và tựa lưng có đệm mang lại một nơi ấm cúng để thư giãn.",
    specs: { 'Kích thước': 'R: 70cm, S: 75cm, C: 85cm', 'Chất liệu': 'Vải lanh, Gỗ sồi', 'Mã SP': 'CH-LA-007' }
  },
  {
    id: 'marble-dining-table',
    name: 'Bàn Ăn Đá Cẩm Thạch',
    price: 1299.99,
    rating: 4.9,
    reviewCount: 56,
    category: 'tables',
    images: ['https://picsum.photos/seed/p8/800/800', 'https://picsum.photos/seed/p8a/800/800', 'https://picsum.photos/seed/p8b/800/800'],
    isNew: true,
    hint: 'bàn đá cẩm thạch',
    description: "Tổ chức những bữa tối đáng nhớ với Bàn Ăn Đá Cẩm Thạch sang trọng. Mặt bàn bằng đá cẩm thạch thật tuyệt đẹp, với những đường vân độc đáo, được nâng đỡ bởi một chân đế kim loại kiểu dáng đẹp, tạo nên một món đồ nổi bật toát lên vẻ sang trọng. Chiếc bàn này có thể chứa sáu người thoải mái, hoàn hảo cho cả bữa ăn gia đình và chiêu đãi khách.",
    specs: { 'Kích thước': 'D: 180cm, R: 90cm, C: 75cm', 'Chất liệu': 'Đá cẩm thạch thật, Thép', 'Mã SP': 'TB-MD-008' }
  },
];

export const inspirationCategories: InspirationCategory[] = [
    {
        name: 'Phòng Khách Hiện Đại',
        description: 'Đường nét gọn gàng, bảng màu đơn giản.',
        href: '/inspiration/living-room',
        image: 'https://picsum.photos/seed/i1/600/400',
        hint: 'phòng khách hiện đại',
    },
    {
        name: 'Phòng Ngủ Ấm Cúng',
        description: 'Kết cấu ấm áp và bố trí thoải mái.',
        href: '/inspiration/bedroom',
        image: 'https://picsum.photos/seed/i2/600/400',
        hint: 'phòng ngủ ấm cúng',
    },
    {
        name: 'Không Gian Ăn Uống Thanh Lịch',
        description: 'Hoàn hảo để tổ chức và bữa ăn gia đình.',
        href: '/inspiration/dining-room',
        image: 'https://picsum.photos/seed/i3/600/400',
        hint: 'phòng ăn thanh lịch',
    },
     {
        name: 'Văn Phòng Tại Nhà Năng Suất',
        description: 'Tạo một không gian làm việc truyền cảm hứng.',
        href: '/inspiration/home-office',
        image: 'https://picsum.photos/seed/i4/600/400',
        hint: 'văn phòng tại nhà',
    },
]
