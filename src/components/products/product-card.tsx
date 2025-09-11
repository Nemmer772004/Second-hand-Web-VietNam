'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/data';
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

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ Link bên ngoài
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
    e.stopPropagation(); // Ngăn sự kiện click lan ra thẻ Link bên ngoài
    e.preventDefault();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  }

  return (
    <Link href={`/products/${product.id}`} className="group relative flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg bg-card overflow-hidden no-underline">
      <div className="relative w-full aspect-square overflow-hidden bg-secondary">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={product.hint}
          />
          {product.images.length > 1 && (
            <Image
                src={product.images[1]}
                alt={`${product.name} alternate view`}
                width={400}
                height={400}
                className="w-full h-full object-cover object-center absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                data-ai-hint={product.hint}
            />
          )}
        <Badge variant={product.condition === "Bảo Hành 3 Tháng" ? "default" : "secondary"} className="absolute top-2 right-2">{product.condition}</Badge>
        {product.price < (product.originalPrice || 0) && <Badge variant="destructive" className="absolute top-10 right-2">Giá Rẻ</Badge>}

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
        <h3 className="text-sm font-medium text-foreground hover:underline">
            {product.name}
        </h3>
        <div className="flex items-center mt-1">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.round(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30'
                )}
              />
            ))}
          </div>
          <span className="ml-2 text-xs text-muted-foreground">({product.reviewCount} đánh giá)</span>
        </div>
        <div className="flex-1 flex items-end mt-2">
            <div className='flex flex-col'>
              {product.originalPrice && (
                <p className="ml-0 text-xs text-muted-foreground line-through">
                  {formatPrice(product.originalPrice)}
                </p>
              )}
              <p className="text-lg font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-full" onClick={handleDialogClick}>Định Giá Nhanh</Button>
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
      </div>
    </Link>
  );
};

export default ProductCard;
