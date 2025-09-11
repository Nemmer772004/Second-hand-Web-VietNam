export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  images: string[];
  isNew: boolean;
  hint: string;
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
    link: "/products/sofas",
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
  { name: 'Sofas', href: '/products/sofas' },
  { name: 'Chairs', href: '/products/chairs' },
  { name: 'Tables', href: '/products/tables' },
  { name: 'Beds', href: '/products/beds' },
  { name: 'Storage', href: '/products/storage' },
  { name: 'Decor', href: '/products/decor' },
];

export const products: Product[] = [
  {
    id: 'velvet-dream-sofa',
    name: 'Velvet Dream Sofa',
    price: 899.99,
    rating: 4.8,
    reviewCount: 124,
    category: 'sofas',
    images: ['https://picsum.photos/seed/p1/800/800', 'https://picsum.photos/seed/p1a/800/800'],
    isNew: true,
    hint: 'velvet sofa',
  },
  {
    id: 'oakwood-coffee-table',
    name: 'Oakwood Coffee Table',
    price: 249.99,
    rating: 4.7,
    reviewCount: 98,
    category: 'tables',
    images: ['https://picsum.photos/seed/p2/800/800', 'https://picsum.photos/seed/p2a/800/800'],
    isNew: false,
    hint: 'oak table',
  },
  {
    id: 'scandi-armchair',
    name: 'Scandi Armchair',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.9,
    reviewCount: 210,
    category: 'chairs',
    images: ['https://picsum.photos/seed/p3/800/800', 'https://picsum.photos/seed/p3a/800/800'],
    isNew: false,
    hint: 'scandinavian armchair',
  },
  {
    id: 'minimalist-platform-bed',
    name: 'Minimalist Platform Bed',
    price: 799.99,
    rating: 4.6,
    reviewCount: 75,
    category: 'beds',
    images: ['https://picsum.photos/seed/p4/800/800', 'https://picsum.photos/seed/p4a/800/800'],
    isNew: true,
    hint: 'platform bed',
  },
  {
    id: 'industrial-bookshelf',
    name: 'Industrial Bookshelf',
    price: 499.99,
    rating: 4.8,
    reviewCount: 150,
    category: 'storage',
    images: ['https://picsum.photos/seed/p5/800/800', 'https://picsum.photos/seed/p5a/800/800'],
    isNew: false,
    hint: 'industrial bookshelf',
  },
  {
    id: 'terracotta-vase-set',
    name: 'Terracotta Vase Set',
    price: 79.99,
    rating: 4.9,
    reviewCount: 302,
    category: 'decor',
    images: ['https://picsum.photos/seed/p6/800/800', 'https://picsum.photos/seed/p6a/800/800'],
    isNew: true,
    hint: 'terracotta vase',
  },
  {
    id: 'linen-accent-chair',
    name: 'Linen Accent Chair',
    price: 299.99,
    rating: 4.5,
    reviewCount: 88,
    category: 'chairs',
    images: ['https://picsum.photos/seed/p7/800/800', 'https://picsum.photos/seed/p7a/800/800'],
    isNew: false,
    hint: 'linen chair',
  },
  {
    id: 'marble-dining-table',
    name: 'Marble Dining Table',
    price: 1299.99,
    rating: 4.9,
    reviewCount: 56,
    category: 'tables',
    images: ['https://picsum.photos/seed/p8/800/800', 'https://picsum.photos/seed/p8a/800/800'],
    isNew: true,
    hint: 'marble table',
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
