// Common Product interface for backend data
export interface Product {
  id: string;
  slug?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  displayCategory?: string;
  image: string;
  stock: number;
  rating: number;
  reviews: number;
  features: string[];
  dimensions: { width: number; height: number; depth: number };
  weight: number;
  createdAt: string;
  updatedAt: string;
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
