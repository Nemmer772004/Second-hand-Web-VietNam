'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS, GET_CATEGORIES } from '@/lib/queries';
import type { Product as CatalogProduct, Category } from '@/lib/types';
import ProductCard from '@/components/products/product-card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  return (
    <Suspense
      fallback={(
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-lg text-muted-foreground">Đang tải trang sản phẩm...</p>
        </div>
      )}
    >
      <ProductsPageContent />
    </Suspense>
  );
}

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('q');

  const normalise = (value: unknown) =>
    String(value ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .trim();

  const initialCategoryToken = initialCategory ? normalise(initialCategory) : undefined;

  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useQuery(GET_PRODUCTS);
  const {
    data: categoriesData,
    loading: categoriesLoading,
  } = useQuery(GET_CATEGORIES);

  const products: CatalogProduct[] = useMemo(
    () => (Array.isArray(productsData?.products) ? productsData.products : []),
    [productsData?.products],
  );

  const categories: Category[] = useMemo(
    () => (Array.isArray(categoriesData?.categories) ? categoriesData.categories : []),
    [categoriesData?.categories],
  );

  const categoryOptions = useMemo(
    () =>
      categories
        .map((category) => ({
          key: (category.id ?? category.name ?? '').toString(),
          label: category.name ?? category.id ?? 'Danh mục chưa đặt tên',
        }))
        .filter((option) => option.key.trim().length > 0),
    [categories],
  );

  const categoryTokenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    categories.forEach((category) => {
      const tokens = new Set<string>();
      if (category.id) {
        tokens.add(normalise(category.id));
      }
      if (category.name) {
        tokens.add(normalise(category.name));
      }
      map.set((category.id ?? category.name ?? '').toString(), Array.from(tokens));
    });
    return map;
  }, [categories]);

  const allMaterials = useMemo(
    () =>
      Array.from(
        new Set(
          products.flatMap((product) =>
            Array.isArray(product.features) ? product.features.filter(Boolean) : [],
          ),
        ),
      ),
    [products],
  );

  const maxPrice = useMemo(() => {
    const validPrices = products
      .map((product) => {
        if (typeof product.price === 'number') {
          return product.price;
        }
        const parsed = Number(product.price ?? 0);
        return Number.isNaN(parsed) ? 0 : parsed;
      })
      .filter((value) => value >= 0);

    if (!validPrices.length) {
      return 0;
    }

    return Math.ceil(Math.max(...validPrices));
  }, [products]);

  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryToken ? [initialCategoryToken] : [],
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    setSearchQuery(initialSearch || '');
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategories([normalise(initialCategory)]);
    } else {
      setSelectedCategories([]);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange((current) => {
        const [, currentMax] = current;
        if (currentMax === 0 || currentMax > maxPrice) {
          return [0, maxPrice];
        }
        return current;
      });
    }
  }, [maxPrice]);

  const handleCategoryChange = (categoryKey: string) => {
    const token = normalise(categoryKey);
    setSelectedCategories((prev) =>
      prev.includes(token) ? prev.filter((value) => value !== token) : [...prev, token],
    );
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials((prev) =>
      prev.includes(material) ? prev.filter((value) => value !== material) : [...prev, material],
    );
  };

  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];

    const activeSearch = searchQuery.trim().toLowerCase();
    if (activeSearch) {
      tempProducts = tempProducts.filter((product) =>
        (product.name ?? '').toLowerCase().includes(activeSearch),
      );
    }

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter((product) => {
        const tokens: string[] = [];

        const collectTokens = (value: unknown) => {
          if (!value) return;
          const raw = value.toString();
          tokens.push(normalise(raw));
          const mapped = categoryTokenMap.get(raw);
          if (mapped) {
            tokens.push(...mapped);
          }
        };

        collectTokens(product.category);
        collectTokens(product.displayCategory);
        collectTokens((product as any).categoryId);

        const uniqueTokens = Array.from(new Set(tokens));
        return selectedCategories.some((token) => uniqueTokens.includes(token));
      });
    }

    if (selectedMaterials.length > 0) {
      const materialTokens = selectedMaterials.map((material) => material.toLowerCase());
      tempProducts = tempProducts.filter((product) =>
        (product.features ?? []).some((feature) =>
          materialTokens.some((token) => feature.toLowerCase().includes(token)),
        ),
      );
    }

    tempProducts = tempProducts.filter((product) => {
      const priceValue =
        typeof product.price === 'number' ? product.price : Number(product.price ?? 0);
      if (Number.isNaN(priceValue)) {
        return false;
      }
      const [min, max] = priceRange;
      const upperBound = max === 0 && maxPrice > 0 ? maxPrice : max;
      return priceValue >= min && (upperBound === 0 || priceValue <= upperBound);
    });

    const sorter = [...tempProducts];
    switch (sortOrder) {
      case 'price-asc':
        sorter.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
        break;
      case 'price-desc':
        sorter.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
        break;
      case 'rating':
        sorter.sort(
          (a, b) => (b.averageRating ?? b.rating ?? 0) - (a.averageRating ?? a.rating ?? 0),
        );
        break;
      case 'newest':
      default:
        sorter.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
        break;
    }

    return sorter;
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    priceRange,
    sortOrder,
    categoryTokenMap,
    maxPrice,
  ]);

  const clearFilters = () => {
    setSelectedCategories(initialCategoryToken ? [initialCategoryToken] : []);
    setPriceRange([0, maxPrice > 0 ? maxPrice : 0]);
    setSelectedMaterials([]);
    setSortOrder('newest');
    setSearchQuery(initialSearch || '');
  };

  const sliderMax = maxPrice > 0 ? maxPrice : 10_000_000;
  const sliderValue = priceRange[1] === 0 ? sliderMax : priceRange[1];

  if (productsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Đang tải...</h1>
          <p className="mt-2 text-lg text-muted-foreground">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Bộ Sưu Tập Của Chúng Tôi</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tìm những món đồ hoàn hảo để hoàn thiện ngôi nhà hoặc mô hình kinh doanh của bạn.
        </p>
        {productsError && (
          <p className="mt-4 text-sm text-yellow-600">
            Không thể kết nối tới máy chủ. Vui lòng thử lại sau.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <h2 className="font-headline text-2xl font-bold mb-4">Bộ lọc</h2>
            <Accordion type="multiple" defaultValue={['search', 'category', 'price']} className="w-full">
              <AccordionItem value="search">
                <AccordionTrigger className="text-lg font-medium">Tìm kiếm</AccordionTrigger>
                <AccordionContent>
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Tìm trong kết quả..."
                      className="pr-10"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-medium">Danh mục</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {categoryOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có danh mục nào.</p>
                    ) : (
                      categoryOptions.map((category) => {
                        const token = normalise(category.key);
                        return (
                          <div key={category.key} className="flex items-center space-x-2">
                            <Checkbox
                              id={`category-${category.key}`}
                              checked={selectedCategories.includes(token)}
                              onCheckedChange={() => handleCategoryChange(category.key)}
                            />
                            <label
                              htmlFor={`category-${category.key}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {category.label}
                            </label>
                          </div>
                        );
                      })
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-medium">Giá</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      min={0}
                      max={sliderMax}
                      step={10_000}
                      value={[sliderValue]}
                      onValueChange={(value) => setPriceRange([0, value[0]])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₫0</span>
                      <span>₫{sliderValue.toLocaleString()}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="material">
                <AccordionTrigger className="text-lg font-medium">Chất liệu</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allMaterials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có dữ liệu chất liệu.</p>
                    ) : (
                      allMaterials.map((material) => (
                        <div key={material} className="flex items-center space-x-2">
                          <Checkbox
                            id={`material-${material}`}
                            checked={selectedMaterials.includes(material)}
                            onCheckedChange={() => handleMaterialChange(material)}
                          />
                          <label
                            htmlFor={`material-${material}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {material}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Button onClick={clearFilters} className="w-full mt-6" variant="outline">
              Xóa bộ lọc
            </Button>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{filteredProducts.length} sản phẩm được tìm thấy</p>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
                <SelectItem value="rating">Đánh giá cao nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
            <div className="text-center py-20 col-span-full">
              <h3 className="font-headline text-2xl">Không tìm thấy sản phẩm nào</h3>
              <p className="text-muted-foreground mt-2">
                Hãy thử điều chỉnh bộ lọc của bạn để tìm thấy những gì bạn đang tìm kiếm.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
