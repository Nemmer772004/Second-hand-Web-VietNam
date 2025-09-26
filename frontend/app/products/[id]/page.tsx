'use client';

import { useMemo, useState, useContext, useEffect } from 'react';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import { GET_PRODUCT_BY_ID, GET_PRODUCTS_BY_CATEGORY } from '@/lib/queries';
import { Button } from '@/components/ui/button';
import { Heart, Minus, Plus, ShoppingCart, Star, Truck, Shield, Camera } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import ProductCard from '@/components/products/product-card';
import { useToast } from '@/hooks/use-toast';
import { CartContext } from '@/context/cart-context';
import { useWishlist } from '@/context/wishlist-context';
import { Badge } from '@/components/ui/badge';
import type { Product as CatalogProduct } from '@/lib/types';
import {
  FALLBACK_PRODUCT_IMAGE,
  getAllDemoProducts,
  resolveDemoProduct,
} from '@/lib/demo-adapter';

function ProductDetailPage({ params }: { params: { id: string } }) {
  // Force client-side rendering
  const [mounted, setMounted] = useState(false);
  
  // All hooks must be called before any early returns
  const { toast } = useToast();
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product data from backend
  const { data: productData, loading: productLoading, error: productError } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: params.id }
  });
  
  const allDemoProducts = useMemo(() => getAllDemoProducts(), []);

  const fallbackResolution = useMemo(() => resolveDemoProduct(params.id), [params.id]);
  const fallbackProduct = fallbackResolution?.product ?? null;
  const fallbackSource = fallbackResolution?.source ?? null;

  const product = (productData?.product as CatalogProduct | undefined) ?? fallbackProduct ?? null;
  
  // Fetch related products
  const { data: relatedData } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { category: product?.category },
    skip: !product?.category
  });
  
  const usingFallbackDemo = !productData?.product && !!fallbackProduct;

  const fallbackNoticeMessage = usingFallbackDemo
    ? fallbackSource === 'hash'
      ? 'Không tìm thấy sản phẩm thực, đang hiển thị sản phẩm demo gần nhất.'
      : 'Hiện không thể kết nối máy chủ. Đang hiển thị dữ liệu demo.'
    : null;

  const relatedProducts: CatalogProduct[] = useMemo(() => {
    if (relatedData?.productsByCategory?.length) {
      return relatedData.productsByCategory.filter((p: CatalogProduct) => p.id !== product?.id).slice(0, 4);
    }

    if (!product) {
      return [];
    }

    return allDemoProducts
      .filter(item => item.category === product.category && item.id !== product.id)
      .slice(0, 4);
  }, [relatedData, product, allDemoProducts]);
  
  const [mainImage, setMainImage] = useState(product?.image ?? FALLBACK_PRODUCT_IMAGE);

  useEffect(() => {
    setMainImage(product?.image ?? FALLBACK_PRODUCT_IMAGE);
  }, [product?.image]);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug info
  useEffect(() => {
    console.log('Product data:', productData);
    console.log('Product:', product);
    console.log('Loading:', productLoading);
    console.log('Error:', productError);
  }, [productData, product, productLoading, productError]);
  
  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Đang tải...</h1>
          <p className="mt-2 text-lg text-muted-foreground">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Đang tải...</h1>
          <p className="mt-2 text-lg text-muted-foreground">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  if (productError && !product) {
    console.error('Product error:', productError);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Lỗi tải sản phẩm</h1>
          <p className="mt-2 text-lg text-muted-foreground">Không thể tải thông tin sản phẩm. Vui lòng thử lại.</p>
          <p className="mt-2 text-sm text-red-500">Lỗi: {productError.message}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Không tìm thấy sản phẩm</h1>
          <p className="mt-2 text-lg text-muted-foreground">Sản phẩm bạn tìm kiếm không tồn tại.</p>
        </div>
      </div>
    );
  }
  
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: "Đã thêm vào giỏ hàng!",
      description: `${quantity} x ${product.name} đã được thêm vào giỏ hàng của bạn.`,
    });
  };
  
  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "Đã xóa khỏi danh sách yêu thích",
        description: `${product.name} đã được xóa khỏi danh sách yêu thích của bạn.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Đã thêm vào danh sách yêu thích!",
        description: `${product.name} đã được thêm vào danh sách yêu thích của bạn.`,
      });
    }
  };
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {fallbackNoticeMessage && (
        <div className="mb-6 rounded-md border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
          {fallbackNoticeMessage}
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
        {/* Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full relative overflow-hidden rounded-lg shadow-lg">
            <Image
              src={mainImage || FALLBACK_PRODUCT_IMAGE}
              alt={product.name}
              fill
              unoptimized
              onError={({ currentTarget }) => {
                currentTarget.src = FALLBACK_PRODUCT_IMAGE;
              }}
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => setMainImage(product.image)}
              className={cn(
                'aspect-square relative rounded-md overflow-hidden transition-all duration-200',
                mainImage === product.image ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
              )}
            >
            <Image
              src={product.image || FALLBACK_PRODUCT_IMAGE}
              alt={`${product.name} thumbnail`}
              fill
              unoptimized
                onError={({ currentTarget }) => {
                  currentTarget.src = FALLBACK_PRODUCT_IMAGE;
                }}
                className="object-cover"
              />
            </button>
            <button
                className={cn(
                  'aspect-square relative rounded-md overflow-hidden transition-all duration-200 flex flex-col items-center justify-center bg-secondary hover:bg-muted',
                )}
              >
                <Camera className="h-6 w-6 text-muted-foreground"/>
                <span className="text-xs text-muted-foreground mt-1">Xem AR</span>
              </button>
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
            <a href="#reviews" className="text-sm text-muted-foreground hover:text-primary">{product.reviews} đánh giá</a>
             <Badge variant="outline">{product.displayCategory ?? product.category}</Badge>
          </div>

          <div className="mt-6">
            <span className="text-3xl font-bold text-primary">{formatPrice(product.price)}</span>
            <p className="text-sm text-muted-foreground mt-1">
              Còn lại: {product.stock} sản phẩm
            </p>
          </div>
          
          <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>
          
          <div className="flex items-center gap-4 mt-8">
             <span className="font-medium">Số lượng:</span>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="h-4 w-4" /></Button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1" onClick={handleAddToCart} variant="secondary">
              <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào giỏ hàng
            </Button>
            <Button size="lg" className="flex-1">
              Mua ngay
            </Button>
             <Button variant="outline" size="icon" aria-label="Thêm vào danh sách yêu thích" onClick={handleWishlistToggle}>
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-rose-500 text-rose-500")} />
             </Button>
          </div>
          
           <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 text-sm">
                <Truck className="h-6 w-6 text-primary" />
                <p><span className="font-semibold">Miễn phí giao hàng</span> cho đơn hàng trên 10.000.000đ trong nội thành.</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
                <Shield className="h-6 w-6 text-primary" />
                <p><span className="font-semibold">Chính sách bảo hành</span> linh hoạt tùy sản phẩm.</p>
            </div>
          </div>

        </div>
      </div>
      
      {/* Product Details & Reviews */}
      <div className="mt-16 lg:mt-24">
         <Accordion type="single" collapsible defaultValue="description" className="w-full">
            <AccordionItem value="description">
                <AccordionTrigger className="text-xl font-headline">Mô tả chi tiết</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                   {product.description}
                </AccordionContent>
            </AccordionItem>
             <AccordionItem value="specifications">
                <AccordionTrigger className="text-xl font-headline">Thông số kỹ thuật</AccordionTrigger>
                <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium">Kích thước</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.dimensions
                              ? `${product.dimensions.width ?? '—'} x ${product.dimensions.height ?? '—'} x ${product.dimensions.depth ?? '—'} cm`
                              : 'Đang cập nhật'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium">Trọng lượng</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.weight != null ? `${product.weight} kg` : 'Đang cập nhật'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">Tính năng</h4>
                        {Array.isArray(product.features) && product.features.length > 0 ? (
                          <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                            {product.features.map((feature: any, index: any) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground mt-2">Đang cập nhật</p>
                        )}
                      </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
            <AccordionItem value="reviews" id="reviews">
                <AccordionTrigger className="text-xl font-headline">Đánh giá từ khách hàng ({product.reviews})</AccordionTrigger>
                <AccordionContent>
                    <p className="text-muted-foreground">Tính năng đánh giá của khách hàng sắp ra mắt!</p>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
      </div>

       {/* Related Products */}
      {relatedProducts.length > 0 && (
         <div className="mt-16 lg:mt-24">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-center">Sản phẩm tương tự</h2>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductDetailPage;
