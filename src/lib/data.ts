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
    title: "Elegance in Every Detail",
    subtitle: "Discover our new collection of handcrafted sofas, designed for modern living.",
    image: "https://picsum.photos/seed/hero1/1920/1080",
    link: "/products",
    cta: "Explore Sofas",
    alt: "A beautiful modern living room with a stylish sofa",
    hint: "living room"
  },
  {
    title: "Timeless Comfort",
    subtitle: "Create a space you love with furniture that blends form and function.",
    image: "https://picsum.photos/seed/hero2/1920/1080",
    link: "/products",
    cta: "Shop The Collection",
    alt: "A cozy bedroom with a comfortable bed and wooden furniture",
    hint: "cozy bedroom"
  }
];

export const productCategories = [
  { name: 'Sofas', href: '/products?category=sofas', key: 'sofas' },
  { name: 'Chairs', href: '/products?category=chairs', key: 'chairs' },
  { name: 'Tables', href: '/products?category=tables', key: 'tables' },
  { name: 'Beds', href: '/products?category=beds', key: 'beds' },
  { name: 'Storage', href: '/products?category=storage', key: 'storage' },
  { name: 'Decor', href: '/products?category=decor', key: 'decor' },
];

export const products: Product[] = [
  {
    id: 'velvet-dream-sofa',
    name: 'Velvet Dream Sofa',
    price: 899.99,
    rating: 4.8,
    reviewCount: 124,
    category: 'sofas',
    images: ['https://picsum.photos/seed/p1/800/800', 'https://picsum.photos/seed/p1a/800/800', 'https://picsum.photos/seed/p1b/800/800'],
    isNew: true,
    hint: 'velvet sofa',
    description: "Indulge in the luxurious comfort of the Velvet Dream Sofa. Its plush velvet upholstery and deep seating make it the perfect centerpiece for any modern living room. The solid wood frame ensures durability, while the high-density foam cushions provide exceptional support. Available in a variety of rich colors to match your decor.",
    specs: { 'Dimensions': 'W: 220cm, D: 95cm, H: 85cm', 'Material': 'Velvet, Solid Wood, High-Density Foam', 'SKU': 'SF-VD-001' }
  },
  {
    id: 'oakwood-coffee-table',
    name: 'Oakwood Coffee Table',
    price: 249.99,
    rating: 4.7,
    reviewCount: 98,
    category: 'tables',
    images: ['https://picsum.photos/seed/p2/800/800', 'https://picsum.photos/seed/p2a/800/800', 'https://picsum.photos/seed/p2b/800/800'],
    isNew: false,
    hint: 'oak table',
    description: "Bring natural elegance to your living space with the Oakwood Coffee Table. Crafted from solid oak with a beautiful grain finish, this table combines minimalist design with practical function. The spacious top and lower shelf provide ample room for books, magazines, and decor. A timeless piece that complements any style.",
    specs: { 'Dimensions': 'W: 120cm, D: 60cm, H: 45cm', 'Material': 'Solid Oak', 'SKU': 'TB-OC-002' }
  },
  {
    id: 'scandi-armchair',
    name: 'Scandi Armchair',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.9,
    reviewCount: 210,
    category: 'chairs',
    images: ['https://picsum.photos/seed/p3/800/800', 'https://picsum.photos/seed/p3a/800/800', 'https://picsum.photos/seed/p3b/800/800'],
    isNew: false,
    hint: 'scandinavian armchair',
    description: "Embrace hygge with the Scandi Armchair. Featuring a clean, minimalist design with a solid wood frame and comfortable, textured upholstery, this chair is the perfect spot to relax and unwind. Its ergonomic shape provides excellent support, making it ideal for reading or enjoying a cup of coffee.",
    specs: { 'Dimensions': 'W: 75cm, D: 80cm, H: 90cm', 'Material': 'Fabric, Solid Wood', 'SKU': 'CH-SA-003' }
  },
  {
    id: 'minimalist-platform-bed',
    name: 'Minimalist Platform Bed',
    price: 799.99,
    rating: 4.6,
    reviewCount: 75,
    category: 'beds',
    images: ['https://picsum.photos/seed/p4/800/800', 'https://picsum.photos/seed/p4a/800/800', 'https://picsum.photos/seed/p4b/800/800'],
    isNew: true,
    hint: 'platform bed',
    description: "Create a serene and uncluttered bedroom with the Minimalist Platform Bed. Its low-profile design and clean lines bring a sense of calm and sophistication. Made from sustainably sourced wood, this bed frame provides a sturdy and stylish foundation for a restful night's sleep.",
    specs: { 'Dimensions': 'Queen - W: 160cm, L: 200cm, H: 30cm', 'Material': 'Solid Pine Wood', 'SKU': 'BD-MP-004' }
  },
  {
    id: 'industrial-bookshelf',
    name: 'Industrial Bookshelf',
    price: 499.99,
    rating: 4.8,
    reviewCount: 150,
    category: 'storage',
    images: ['https://picsum.photos/seed/p5/800/800', 'https://picsum.photos/seed/p5a/800/800', 'https://picsum.photos/seed/p5b/800/800'],
    isNew: false,
    hint: 'industrial bookshelf',
    description: "Showcase your favorite books and decor with the Industrial Bookshelf. The combination of rustic wood shelves and a sturdy metal frame creates a bold, modern look. With five spacious shelves, it offers ample storage and display space for any room in your home.",
    specs: { 'Dimensions': 'W: 100cm, D: 30cm, H: 180cm', 'Material': 'Reclaimed Wood, Steel', 'SKU': 'ST-IB-005' }
  },
  {
    id: 'terracotta-vase-set',
    name: 'Terracotta Vase Set',
    price: 79.99,
    rating: 4.9,
    reviewCount: 302,
    category: 'decor',
    images: ['https://picsum.photos/seed/p6/800/800', 'https://picsum.photos/seed/p6a/800/800', 'https://picsum.photos/seed/p6b/800/800'],
    isNew: true,
    hint: 'terracotta vase',
    description: "Add a touch of earthy warmth to your home with this set of three terracotta vases. Each vase features a unique, handcrafted shape and a matte finish. Perfect for displaying dried flowers or as standalone decorative pieces, they bring a natural, rustic charm to any space.",
    specs: { 'Dimensions': 'Varying heights (15cm, 20cm, 25cm)', 'Material': 'Terracotta Clay', 'SKU': 'DC-TV-006' }
  },
  {
    id: 'linen-accent-chair',
    name: 'Linen Accent Chair',
    price: 299.99,
    rating: 4.5,
    reviewCount: 88,
    category: 'chairs',
    images: ['https://picsum.photos/seed/p7/800/800', 'https://picsum.photos/seed/p7a/800/800', 'https://picsum.photos/seed/p7b/800/800'],
    isNew: false,
    hint: 'linen chair',
    description: "The Linen Accent Chair is a versatile piece that adds comfort and style to any corner. Upholstered in a breathable, natural linen fabric, it features a classic design with a modern twist. The cushioned seat and backrest provide a cozy spot for relaxation.",
    specs: { 'Dimensions': 'W: 70cm, D: 75cm, H: 85cm', 'Material': 'Linen, Oak Wood', 'SKU': 'CH-LA-007' }
  },
  {
    id: 'marble-dining-table',
    name: 'Marble Dining Table',
    price: 1299.99,
    rating: 4.9,
    reviewCount: 56,
    category: 'tables',
    images: ['https://picsum.photos/seed/p8/800/800', 'https://picsum.photos/seed/p8a/800/800', 'https://picsum.photos/seed/p8b/800/800'],
    isNew: true,
    hint: 'marble table',
    description: "Host memorable dinners with the luxurious Marble Dining Table. The stunning genuine marble top, with its unique veining, is supported by a sleek metal base, creating a statement piece that exudes elegance. This table comfortably seats six, making it perfect for both family meals and entertaining guests.",
    specs: { 'Dimensions': 'L: 180cm, W: 90cm, H: 75cm', 'Material': 'Genuine Marble, Steel', 'SKU': 'TB-MD-008' }
  },
];

export const inspirationCategories: InspirationCategory[] = [
    {
        name: 'Modern Living Rooms',
        description: 'Clean lines, simple color palettes.',
        href: '/inspiration/living-room',
        image: 'https://picsum.photos/seed/i1/600/400',
        hint: 'modern living',
    },
    {
        name: 'Cozy Bedrooms',
        description: 'Warm textures and comfortable layouts.',
        href: '/inspiration/bedroom',
        image: 'https://picsum.photos/seed/i2/600/400',
        hint: 'cozy bedroom',
    },
    {
        name: 'Elegant Dining Spaces',
        description: 'Perfect for hosting and family meals.',
        href: '/inspiration/dining-room',
        image: 'https://picsum.photos/seed/i3/600/400',
        hint: 'elegant dining',
    },
     {
        name: 'Productive Home Offices',
        description: 'Create a workspace that inspires.',
        href: '/inspiration/home-office',
        image: 'https://picsum.photos/seed/i4/600/400',
        hint: 'home office',
    },
]
