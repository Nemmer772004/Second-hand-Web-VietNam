'use client';

import { useState } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/products/product-card';
import { useToast } from '@/hooks/use-toast';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const product = products.find(p => p.id === params.id);
  
  const [mainImage, setMainImage] = useState(product?.images[0]);

  if (!product) {
    notFound();
  }
  
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    toast({
      title: "Added to cart!",
      description: `${quantity} x ${product.name} has been added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg">
            <Image
              src={mainImage || product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              data-ai-hint={product.hint}
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setMainImage(img)}
                className={cn(
                  'aspect-square relative rounded-md overflow-hidden transition-all duration-200',
                  mainImage === img ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                )}
              >
                <Image
                  src={img}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                   data-ai-hint={product.hint}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
          
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn('h-5 w-5', i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50')}
                />
              ))}
            </div>
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-primary">{product.reviewCount} reviews</a>
          </div>

          <div className="mt-6">
            <span className="text-3xl font-bold">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className="ml-4 text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
            )}
          </div>
          
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          
          <div className="flex items-center gap-4 mt-8">
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart}>
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="flex-1">
              Buy Now
            </Button>
             <Button variant="outline" size="icon" aria-label="Add to wishlist">
                <Heart className="h-5 w-5" />
             </Button>
          </div>
          
           <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm">
                <Truck className="h-6 w-6 text-primary" />
                <p><span className="font-semibold">Free Delivery</span> on orders over $50.</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <Shield className="h-6 w-6 text-primary" />
                <p><span className="font-semibold">1-Year Warranty</span> on all products.</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Product Details & Reviews */}
      <div className="mt-16 lg:mt-24">
         <Accordion type="single" collapsible defaultValue="description" className="w-full">
            <AccordionItem value="description">
                <AccordionTrigger className="text-xl font-headline">Description</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                   {product.description}
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="specifications">
                <AccordionTrigger className="text-xl font-headline">Specifications</AccordionTrigger>
                <AccordionContent>
                    <table className="w-full text-sm">
                        <tbody>
                            {Object.entries(product.specs).map(([key, value]) => (
                                <tr key={key} className="border-b">
                                    <td className="py-2 pr-4 font-medium">{key}</td>
                                    <td className="py-2 text-muted-foreground">{value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reviews" id="reviews">
                <AccordionTrigger className="text-xl font-headline">Reviews ({product.reviewCount})</AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground">Customer reviews coming soon!</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

       {/* Related Products */}
      {relatedProducts.length > 0 && (
         <div className="mt-16 lg:mt-24">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center">You Might Also Like</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
