'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Upload, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/wishlist-context';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog"
import { Input } from '../ui/input';
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isWishlisted = wishlist.some(item => item.id === product.id);
  const [cardImage, setCardImage] = useState(
    product.image || product.images?.[0] || DEFAULT_PRODUCT_IMAGE,
  );
  const previewImage = useMemo(
    () => product.image || product.images?.[0] || DEFAULT_PRODUCT_IMAGE,
    [product.image, product.images],
  );
  const productSlug = product.slug ?? product.id;
  const rating = product.averageRating ?? product.rating ?? 0;
  const reviewCount = product.reviewCount ?? product.reviews?.length ?? 0;
  const availableStock = product.stock ?? 0;
  const categoryLabel = product.displayCategory || product.category || 'Đang cập nhật';

  useEffect(() => {
    setCardImage(product.image || product.images?.[0] || DEFAULT_PRODUCT_IMAGE);
  }, [product.image, product.images]);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    e.preventDefault();
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({
        title: "Đã xóa khỏi danh sách yêu thích",
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Đã thêm vào danh sách yêu thích!",
      });
    }
  };
  
  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  return (
    <div className="group relative flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg bg-card overflow-hidden">
      <div className="relative w-full aspect-square overflow-hidden bg-secondary">
          <Dialog>
            <DialogTrigger asChild>
              <div className="w-full h-full cursor-pointer">
                <Image
                  src={cardImage}
                  alt={product.name}
                  width={400}
                  height={400}
                  unoptimized
                  onError={() => setCardImage(DEFAULT_PRODUCT_IMAGE)}
                  className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </DialogTrigger>
             <DialogContent className="max-w-3xl">
                <Image
                    src={previewImage}
                    alt={product.name}
                    width={800}
                    height={800}
                    unoptimized
                    onError={({ currentTarget }) => {
                      currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                    className="w-full h-auto object-contain rounded-md"
                />
            </DialogContent>
          </Dialog>
        
        <Badge variant="secondary" className="absolute top-2 right-2">{categoryLabel}</Badge>
        {availableStock < 5 && (
          <Badge variant="destructive" className="absolute top-10 right-2">Sắp hết hàng</Badge>
        )}

        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 left-2 bg-background/50 hover:bg-background/80 rounded-full" 
            aria-label="Thêm vào danh sách yêu thích"
            onClick={handleWishlistToggle}
        >
          <Heart className={cn("h-5 w-5 text-foreground", isWishlisted && "fill-rose-500 text-rose-500")} />
        </Button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-foreground">
          <Link href={`/products/${productSlug}`} className="hover:underline">
            <span className="absolute inset-0 z-0" />
            {product.name}
          </Link>
        </h3>
        {product.brand && (
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>
        )}
        <div className="flex items-center mt-1">
          <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    'h-4 w-4',
                  i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-muted-foreground">({reviewCount} đánh giá)</span>
        </div>
        <div className="flex-1 flex items-end mt-2">
            <div className='flex flex-col'>
              <p className="text-lg font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
              <p className="text-xs text-muted-foreground">
                Còn lại: {availableStock} sản phẩm
              </p>
            </div>
        </div>
        <div className="mt-2 flex flex-col gap-2 z-10">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full" onClick={handleDialogClick}>Định Giá Nhanh</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Định giá nhanh sản phẩm của bạn</DialogTitle>
                  <DialogDescription>
                    Tải lên hình ảnh sản phẩm bạn muốn bán, chúng tôi sẽ ước tính giá thu mua.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg">
                  <Upload className="w-12 h-12 text-muted-foreground"/>
                  <Input type="file" className="mt-4"/>
                  <Button className="mt-4">Gửi Định Giá</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button asChild size="sm" className="w-full">
              <Link href={`/products/${productSlug}`}>
                <Eye className="mr-2 h-4 w-4" />
                Xem Chi Tiết
              </Link>
            </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
