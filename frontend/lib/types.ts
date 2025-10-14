// Common Product interface for backend data
export interface ProductReview {
  reviewId: number;
  star: number;
  reviewerName: string;
  content: string;
  time?: string;
  variation?: string;
  likedCount?: number;
  images?: string[];
  shopReply?: string | null;
}

export interface Product {
  id: string;
  slug?: string;
  name: string;
  description?: string;
  price: number;
  productId?: number;
  category?: string;
  categoryName?: string;
  displayCategory?: string;
  image?: string;
  images?: string[];
  brand?: string;
  soldCount?: number;
  legacyId?: number;
  stock?: number;
  rating?: number;
  averageRating?: number;
  reviewCount?: number;
  reviews?: ProductReview[];
  features?: string[];
  dimensions?: { width?: number; height?: number; depth?: number } | null;
  weight?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

// User interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Cart Item interface
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Order interface
export interface Order {
  id: string;
  userId: string;
  items: {
    productId: string;
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}
