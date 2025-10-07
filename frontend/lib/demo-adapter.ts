import { products as demoProducts } from './data';
import type { Product as CatalogProduct } from './types';

export const FALLBACK_PRODUCT_IMAGE = 'https://placehold.co/800x800?text=No+Image';

type DemoProduct = (typeof demoProducts)[number];

export interface DemoLookupResult {
  product: CatalogProduct;
  source: 'id' | 'slug' | 'hash';
}

const mapDemoProductToCatalog = (product: DemoProduct): CatalogProduct => ({
  id: product.id,
  slug: product.id,
  name: product.name,
  description: product.description,
  price: product.price,
  productId: Number(product.id) || undefined,
  category: product.category,
  displayCategory: product.category,
  image: product.images[0] ?? FALLBACK_PRODUCT_IMAGE,
  stock: product.status === 'Còn Hàng' ? 20 : 0,
  rating: product.rating,
  averageRating: product.rating,
  reviewCount: product.reviewCount,
  reviews: [],
  features: Object.entries(product.specs || {}).map(([key, value]) => `${key}: ${value}`),
  dimensions: { width: 0, height: 0, depth: 0 },
  weight: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const computeStableIndex = (value: string): number => {
  if (!demoProducts.length) {
    return 0;
  }

  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % demoProducts.length;
  }

  return hash;
};

export const resolveDemoProduct = (id: string): DemoLookupResult | null => {
  if (!id) {
    return null;
  }

  const normalisedId = id.trim();
  const lowerId = normalisedId.toLowerCase();

  const exactMatch = demoProducts.find(product => product.id === normalisedId);
  if (exactMatch) {
    return { product: mapDemoProductToCatalog(exactMatch), source: 'id' };
  }

  const slugMatch = demoProducts.find(product =>
    product.name.toLowerCase().replace(/\s+/g, '-') === lowerId,
  );
  if (slugMatch) {
    return { product: mapDemoProductToCatalog(slugMatch), source: 'slug' };
  }

  const fallbackIndex = computeStableIndex(lowerId);
  const hashedFallback = demoProducts[fallbackIndex];
  if (!hashedFallback) {
    return null;
  }

  return { product: mapDemoProductToCatalog(hashedFallback), source: 'hash' };
};

export const getAllDemoProducts = (): CatalogProduct[] =>
  demoProducts.map(mapDemoProductToCatalog);

export const getDemoCategories = () => {
  const categoriesMap = new Map<
    string,
    {
      id: string;
      name: string;
      description: string;
      image: string;
      createdAt: string;
      updatedAt: string;
    }
  >();

  demoProducts.forEach(product => {
    if (!categoriesMap.has(product.category)) {
      categoriesMap.set(product.category, {
        id: product.category,
        name: product.category,
        description: '',
        image: '',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      });
    }
  });

  return Array.from(categoriesMap.values());
};

export const findDemoProductById = (id: string): CatalogProduct | null =>
  resolveDemoProduct(id)?.product ?? null;
