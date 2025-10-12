'use client';

import { useMemo, useState, useContext, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useQuery } from '@apollo/client';
import Link from 'next/link';
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
import { DEFAULT_PRODUCT_IMAGE } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';
import { logInteraction } from '@/lib/interaction-tracker';

function ProductDetailPage({ params }: { params: { id: string } }) {
  const [mounted, setMounted] = useState(false);

  const { toast } = useToast();
  const { addToCart } = useContext(CartContext);
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const loggedViewProductIdRef = useRef<string | null>(null);

  const {
    data: productData,
    loading: productLoading,
    error: productError,
    refetch: refetchProduct,
  } = useQuery(GET_PRODUCT_BY_ID, {
    variables: { id: params.id },
  });

  const product = productData?.product as CatalogProduct | undefined;

  const galleryImages = useMemo(() => {
    const collected = [
      product?.image,
      ...(Array.isArray(product?.images) ? product.images : []),
    ].filter((url): url is string => !!url && url.trim().length > 0);
    return Array.from(new Set(collected));
  }, [product?.image, product?.images]);

  const primaryImage = galleryImages[0] ?? DEFAULT_PRODUCT_IMAGE;
  const availableStock = product?.stock ?? 0;
  const categoryLabel = product?.displayCategory || product?.category || 'Đang cập nhật';
  const brandLabel = product?.brand;

  const { data: relatedData } = useQuery(GET_PRODUCTS_BY_CATEGORY, {
    variables: { category: product?.category },
    skip: !product?.category,
  });

  const relatedProducts: CatalogProduct[] = useMemo(() => {
    if (!relatedData?.productsByCategory?.length) {
      return [];
    }
    return relatedData.productsByCategory
      .filter((p: CatalogProduct) => p.id !== product?.id)
      .slice(0, 4);
  }, [relatedData, product?.id]);

  const [mainImage, setMainImage] = useState(primaryImage);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'media' | 1 | 2 | 3 | 4 | 5>('all');
  const [hasRefetchedByProductId, setHasRefetchedByProductId] = useState(false);

  const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  const rating = product?.averageRating ?? product?.rating ?? 0;
  const reviewSummary = useMemo(() => {
    const base = {
      total: reviews.length,
      counts: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      } as Record<1 | 2 | 3 | 4 | 5, number>,
      media: 0,
    };

    reviews.forEach((review) => {
      const roundedStar = Math.round(review.star ?? 0) as 1 | 2 | 3 | 4 | 5;
      if (roundedStar >= 1 && roundedStar <= 5) {
        base.counts[roundedStar] = (base.counts[roundedStar] ?? 0) + 1;
      }

      if (Array.isArray(review.images) && review.images.length > 0) {
        base.media += 1;
      }
    });

    if (base.total === 0 && product?.reviewCount && product.reviewCount > 0) {
      const rounded = Math.min(Math.max(Math.round(rating), 1), 5) as 1 | 2 | 3 | 4 | 5;
      base.counts[rounded] = product.reviewCount;
      base.total = product.reviewCount;
    }

    return base;
  }, [reviews, product?.reviewCount, rating]);

  const reviewCount =
    reviewSummary.total > 0 ? reviewSummary.total : product?.reviewCount ?? product?.reviews?.length ?? 0;

  const filteredReviews = useMemo(() => {
    switch (reviewFilter) {
      case 'all':
        return reviews;
      case 'media':
        return reviews.filter((review) => Array.isArray(review.images) && review.images.length > 0);
      default:
        return reviews.filter((review) => Math.round(review.star ?? 0) === reviewFilter);
    }
  }, [reviewFilter, reviews]);

  const soldCount =
    product?.soldCount ?? (reviewSummary.total > 0 ? reviewSummary.total : product?.reviewCount ?? undefined);

  useEffect(() => {
    setMainImage(primaryImage);
  }, [primaryImage]);

  useEffect(() => {
    setHasRefetchedByProductId(false);
  }, [params.id]);

  useEffect(() => {
    if (
      !hasRefetchedByProductId &&
      productData?.product &&
      Array.isArray(productData.product.reviews) &&
      productData.product.reviews.length === 0 &&
      (productData.product.reviewCount ?? 0) > 0 &&
      productData.product.productId != null
    ) {
      setHasRefetchedByProductId(true);
      refetchProduct({ id: String(productData.product.productId) }).catch((err) =>
        console.warn('Không thể refetch sản phẩm theo productId:', err),
      );
    }
  }, [hasRefetchedByProductId, productData?.product, refetchProduct]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!product?.id) {
      return;
    }

    if (loggedViewProductIdRef.current === product.id) {
      return;
    }

    loggedViewProductIdRef.current = product.id;

    void logInteraction({
      eventType: 'view',
      userId: user?.id,
      productId: product.id,
      metadata: {
        name: product.name,
        price: product.price,
        category: product.category,
      },
    });
  }, [product?.id, product?.name, product?.price, product?.category, user?.id]);

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
          <h1 className="font-headline text-4xl font-bold">Đang tải sản phẩm...</h1>
          <p className="mt-2 text-lg text-muted-foreground">Chúng tôi đang truy vấn dữ liệu mới nhất.</p>
        </div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Không thể tải sản phẩm</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Đã xảy ra lỗi khi kết nối đến máy chủ. Vui lòng thử lại sau.
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="font-headline text-4xl font-bold">Không tìm thấy sản phẩm</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sản phẩm bạn đang tìm kiếm có thể đã bị xoá hoặc không tồn tại.
          </p>
        </div>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.id === product.id);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
      toast({ title: 'Đã xóa khỏi danh sách yêu thích' });
    } else {
      addToWishlist(product);
      toast({ title: 'Đã thêm vào danh sách yêu thích!' });
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    toast({
      title: 'Đã thêm vào giỏ hàng',
      description: `${product.name} x${quantity}`,
    });
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="grid gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
            <Image
              src={mainImage || DEFAULT_PRODUCT_IMAGE}
              alt={product.name}
              fill
              className="object-cover"
              unoptimized
              onError={({ currentTarget }) => {
                currentTarget.src = DEFAULT_PRODUCT_IMAGE;
              }}
            />
            <Badge variant="secondary" className="absolute top-2 right-2">
              {categoryLabel}
            </Badge>
            {availableStock < 5 && (
              <Badge variant="destructive" className="absolute top-12 right-2">
                Sắp hết hàng
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-3 right-3 bg-background/80 hover:bg-background"
              onClick={() => toast({ title: 'Liên hệ để xem trực tiếp sản phẩm' })}
            >
              <Camera className="h-5 w-5" />
            </Button>
          </div>
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((image) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setMainImage(image)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-md border',
                    mainImage === image ? 'border-primary' : 'border-transparent',
                  )}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - preview`}
                    fill
                    className="object-cover"
                    unoptimized
                    onError={({ currentTarget }) => {
                      currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-headline text-3xl md:text-4xl font-bold">{product.name}</h1>
              {brandLabel && (
                <p className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">{brandLabel}</p>
              )}
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      className={cn(
                        'h-4 w-4',
                        index < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/30',
                      )}
                    />
                  ))}
                </div>
                <span>({reviewCount} đánh giá)</span>
                {soldCount && <span>• Đã bán: {soldCount}</span>}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={cn('rounded-full border', isWishlisted && 'bg-rose-50 text-rose-500')}
              onClick={handleWishlistToggle}
            >
              <Heart className={cn('h-5 w-5', isWishlisted && 'fill-rose-500')} />
            </Button>
          </div>

          <div className="mt-6 rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-6">
              <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Còn lại: {availableStock} sản phẩm</p>
                <p>Kho: {product.stock ?? 0} | Mã: {product.productId ?? 'Đang cập nhật'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Số lượng</span>
                <div className="flex items-center rounded-md border">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Thêm vào giỏ hàng
                </Button>
                <Button size="lg" variant="outline" className="w-full">
                  Yêu cầu báo giá
                </Button>
              </div>
              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  <span>Giao hàng tiêu chuẩn trong 24-48h tại Hà Nội</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Bảo hành tối thiểu 3 tháng đối với thiết bị điện lạnh</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-headline text-2xl font-bold">Mô tả chi tiết</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description || 'Thông tin chi tiết đang được cập nhật.'}
            </p>
          </div>

          {Array.isArray(product.features) && product.features.length > 0 && (
            <div className="mt-8">
              <h2 className="font-headline text-2xl font-bold">Thông số nổi bật</h2>
              <ul className="mt-4 grid md:grid-cols-2 gap-3">
                {product.features.map((feature) => (
                  <li key={feature} className="rounded-md border bg-card px-4 py-3 text-sm">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.dimensions && (
            <div className="mt-8 grid gap-2 text-sm text-muted-foreground">
              <p>Kích thước (Rộng x Sâu x Cao): {product.dimensions.width ?? '—'} x {product.dimensions.depth ?? '—'} x {product.dimensions.height ?? '—'} cm</p>
              {product.weight && <p>Trọng lượng: {product.weight} kg</p>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-headline text-2xl font-bold mb-6">Đánh giá sản phẩm</h2>
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{rating.toFixed(1)}</div>
              <div className="mt-2 text-sm text-muted-foreground">Trên tổng số {reviewCount} đánh giá</div>
            </div>
            <div className="mt-6 space-y-2">
              {([5, 4, 3, 2, 1] as const).map((star) => {
                const count = reviewSummary.counts[star] ?? 0;
                const percentage = reviewSummary.total ? Math.round((count / reviewSummary.total) * 100) : 0;
                return (
                  <button
                    key={star}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent',
                      reviewFilter === star && 'bg-accent text-accent-foreground',
                    )}
                    onClick={() => setReviewFilter(star)}
                  >
                    <span className="flex items-center gap-1">
                      {star}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="tabular-nums text-muted-foreground">{count}</span>
                  </button>
                );
              })}
              {reviewSummary.media > 0 && (
                <button
                  type="button"
                  className={cn(
                    'mt-4 w-full rounded-md border px-3 py-2 text-sm hover:bg-accent',
                    reviewFilter === 'media' && 'bg-accent text-accent-foreground',
                  )}
                  onClick={() => setReviewFilter('media')}
                >
                  Đánh giá kèm hình ảnh ({reviewSummary.media})
                </button>
              )}
              <button
                type="button"
                className={cn(
                  'mt-2 w-full rounded-md border px-3 py-2 text-sm hover:bg-accent',
                  reviewFilter === 'all' && 'bg-accent text-accent-foreground',
                )}
                onClick={() => setReviewFilter('all')}
              >
                Tất cả đánh giá
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {filteredReviews.length === 0 ? (
              <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
                Chưa có đánh giá phù hợp với bộ lọc.
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.reviewId ?? `${review.reviewerName}-${review.time}`} className="rounded-lg border bg-card p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{review.reviewerName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, index) => (
                            <Star
                              key={index}
                              className={cn(
                                'h-3 w-3',
                                index < Math.round(review.star ?? 0)
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-muted-foreground/30',
                              )}
                            />
                          ))}
                        </div>
                        {review.time && <span>{review.time}</span>}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{review.content}</p>
                  {Array.isArray(review.images) && review.images.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {review.images.map((image) => (
                        <div key={image} className="relative h-20 w-20 overflow-hidden rounded-md border">
                          <Image
                            src={image}
                            alt="Ảnh đánh giá"
                            fill
                            className="object-cover"
                            unoptimized
                            onError={({ currentTarget }) => {
                              currentTarget.src = DEFAULT_PRODUCT_IMAGE;
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {review.shopReply && (
                    <div className="mt-4 rounded-md bg-muted px-4 py-3 text-sm">
                      <p className="font-medium">Phản hồi từ cửa hàng</p>
                      <p className="mt-1 text-muted-foreground">{review.shopReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-2xl font-bold">Sản phẩm liên quan</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={product.category ? `/products?category=${encodeURIComponent(product.category)}` : '/products'}>
              Xem thêm
            </Link>
          </Button>
        </div>
        {relatedProducts.length === 0 ? (
          <div className="rounded-lg border bg-card p-6 text-center text-muted-foreground">
            Chưa có sản phẩm liên quan để hiển thị.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
