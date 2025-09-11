'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { products, productCategories } from '@/lib/data';
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

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  
  const allMaterials = useMemo(() => Array.from(new Set(products.flatMap(p => p.specs.Material ? p.specs.Material.split(',').map(m => m.trim()) : []))), []);
  const maxPrice = useMemo(() => Math.ceil(Math.max(...products.map(p => p.price))), []);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, maxPrice]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState('newest');

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

    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => selectedCategories.includes(p.category));
    }

    if (selectedMaterials.length > 0) {
      tempProducts = tempProducts.filter(p => 
        selectedMaterials.some(m => p.specs.Material?.toLowerCase().includes(m.toLowerCase()))
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
        tempProducts.sort((a, b) => (b.isNew ? 1 : -1) - (a.isNew ? 1 : -1) || products.indexOf(a) - products.indexOf(b));
        break;
    }

    return tempProducts;
  }, [selectedCategories, priceRange, selectedMaterials, sortOrder]);


  return (
    <div className="container mx-auto px-4 py-8">
       <div className="mb-8 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Collection</h1>
        <p className="mt-2 text-lg text-muted-foreground">Find the perfect pieces to complete your home.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <h2 className="font-headline text-2xl font-bold mb-4">Filters</h2>
            <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
              <AccordionItem value="category">
                <AccordionTrigger className="text-lg font-medium">Category</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {productCategories.map(category => (
                      <div key={category.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={category.key}
                          checked={selectedCategories.includes(category.key)}
                          onCheckedChange={() => handleCategoryChange(category.key)}
                        />
                        <label htmlFor={category.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                          {category.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price">
                <AccordionTrigger className="text-lg font-medium">Price</AccordionTrigger>
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
                      <span>$0</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="material">
                <AccordionTrigger className="text-lg font-medium">Material</AccordionTrigger>
                <AccordionContent>
                   <div className="space-y-2">
                    {allMaterials.map(material => (
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
             <Button onClick={() => {
                setSelectedCategories([]);
                setPriceRange([0, maxPrice]);
                setSelectedMaterials([]);
             }} className="w-full mt-6" variant="outline">
                Clear Filters
            </Button>
          </div>
        </aside>

        <main className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{filteredProducts.length} products found</p>
             <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && (
             <div className="text-center py-20">
                <h3 className="font-headline text-2xl">No Products Found</h3>
                <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}
