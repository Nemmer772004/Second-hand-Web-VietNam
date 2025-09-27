
'use client';

import { Suspense, useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS, GET_CATEGORIES } from '@/lib/queries';
import { getAllDemoProducts, getDemoCategories } from '@/lib/demo-adapter';
import type { Product as CatalogProduct } from '@/lib/types';
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
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function ProductsPage() {
  return (
    <Suspense fallback={(
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-lg text-muted-foreground">Đang tải trang sản phẩm...</p>
      </div>
    )}>
      <ProductsPageContent />
    </Suspense>
  );
}


function ProductsPageContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('q');
  
  // Fetch data from backend
  const { data: productsData, loading: productsLoading, error: productsError } = useQuery(GET_PRODUCTS);
  const { data: categoriesData, loading: categoriesLoading } = useQuery(GET_CATEGORIES);

  const fallbackProducts = useMemo(() => getAllDemoProducts(), []);
  const fallbackCategories = useMemo(() => getDemoCategories(), []);

  const products: CatalogProduct[] = (productsData?.products?.length ? productsData.products : fallbackProducts) as CatalogProduct[];
  const categories = categoriesData?.categories?.length ? categoriesData.categories : fallbackCategories;
  
  const allMaterials = useMemo(
    () => Array.from(new Set(products.flatMap((p: any) => (p.features ? p.features : [])))),
    [products],
  );
  const maxPrice = useMemo(() => products.length > 0 ? Math.ceil(Math.max(...products.map((p: any) => p.price))) : 10000000, [products]);

  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    // This effect ensures the search input in the filter section
    // stays in sync with the URL query parameter.
    setSearchQuery(initialSearch || '');
  }, [initialSearch]);

  const handleCategoryChange = (categoryKey: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(c => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  const handleMaterialChange = (material: string) => {
    setSelectedMaterials(prev =>
      prev.includes(material)
        ? prev.filter(m => m !== material)
        : [...prev, material]
    );
  };

  const filteredProducts = useMemo(() => {
    let tempProducts = [...products];
    const currentSearchQuery = initialSearch || '';

    if (currentSearchQuery) {
        tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(currentSearchQuery.toLowerCase()));
    }

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedMaterials.length > 0) {
      tempProducts = tempProducts.filter((p: any) => 
        selectedMaterials.some(m => p.features?.some((f: any) => f.toLowerCase().includes(m.toLowerCase())))
      );
    }
    
    tempProducts = tempProducts.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortOrder) {
      case 'price-asc':
        tempProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        tempProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
      default:
        // Sort by createdAt (newest first)
        tempProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return tempProducts;
  }, [selectedCategories, priceRange, selectedMaterials, sortOrder, initialSearch]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSelectedMaterials([]);
    setSortOrder('newest');
    // Note: We don't clear the search query from the URL here,
    // as it's the primary filter on this page.
    // A separate action/button might be needed to clear the search itself.
  };

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

  const usingFallbackProducts = !(productsData?.products?.length);

  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Bộ Sưu Tập Của Chúng Tôi</h1>
        <p className="mt-2 text-lg text-muted-foreground">Tìm những món đồ hoàn hảo để hoàn thiện ngôi nhà của bạn.</p>
        {productsError && usingFallbackProducts && (
          <p className="mt-4 text-sm text-yellow-600">
            Không thể kết nối tới máy chủ. Đang hiển thị dữ liệu demo.
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      // This input now only filters the *currently visible* results on the client side
                      // The main search is driven by the URL param 'q'
                    />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-medium">Danh mục</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {categories.map((category: any) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.id}
                          checked={selectedCategories.includes(category.name)}
                          onCheckedChange={() => handleCategoryChange(category.name)}
                        />
                        <label htmlFor={category.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-medium">Giá</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <Slider
                      min={0}
                      max={maxPrice}
                      step={10}
                      value={[priceRange[1]]}
                      onValueChange={(value) => setPriceRange([0, value[0]])}
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>₫0</span>
                      <span>₫{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="material">
                <AccordionTrigger className="text-lg font-medium">Chất liệu</AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allMaterials.map((material: any) => (
                      <div key={material} className="flex items-center space-x-2">
                        <Checkbox
                          id={material}
                          checked={selectedMaterials.includes(material)}
                          onCheckedChange={() => handleMaterialChange(material)}
                        />
                        <label htmlFor={material} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {material}
                        </label>
                      </div>
                    ))}
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
            {filteredProducts
              .filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase())) // Client-side filtering based on the filter input
              .map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
             <div className="text-center py-20 col-span-full">
                <h3 className="font-headline text-2xl">Không tìm thấy sản phẩm nào</h3>
                <p className="text-muted-foreground mt-2">Hãy thử điều chỉnh bộ lọc của bạn để tìm thấy những gì bạn đang tìm kiếm.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
