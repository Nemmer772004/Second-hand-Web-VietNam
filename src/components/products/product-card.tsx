import Image from 'next/image';
import Link from 'next/link';
import { Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/context/wishlist-context';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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


  return (
    <div className="group relative flex flex-col">
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-secondary">
        <Link href={`/products/${product.id}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover object-center transition-opacity duration-300 group-hover:opacity-0"
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
        </Link>
        {product.isNew && (
          <Badge variant="destructive" className="absolute top-2 right-2">Mới</Badge>
        )}
        <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 left-2 bg-background/50 hover:bg-background/80" 
            aria-label="Thêm vào danh sách yêu thích"
            onClick={handleWishlistToggle}
        >
          <Heart className={cn("h-5 w-5 text-foreground", isWishlisted && "fill-destructive text-destructive")} />
        </Button>
      </div>
      <div className="mt-4 flex flex-col flex-1">
        <h3 className="text-sm font-medium text-foreground">
          <Link href={`/products/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
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
            <p className="text-lg font-semibold text-foreground">
              ${product.price.toFixed(2)}
            </p>
            {product.originalPrice && (
              <p className="ml-2 text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
