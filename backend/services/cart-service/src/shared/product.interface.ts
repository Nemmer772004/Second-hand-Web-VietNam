export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory: string;
  images: string[];
  specs?: Record<string, any>;
  stock: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
