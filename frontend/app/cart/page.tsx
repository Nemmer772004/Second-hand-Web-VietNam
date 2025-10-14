'use client';

import { useContext, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { CartContext } from '@/context/cart-context';
import type { CartItem } from '@/lib/types';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { CREATE_ORDER } from '@/lib/queries';
import { logInteraction } from '@/lib/interaction-tracker';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paid_online' | 'cod'>('paid_online');
  const [note, setNote] = useState('');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createOrderMutation, { loading: creatingOrder }] = useMutation(CREATE_ORDER);

  const subtotal = cart.reduce(
    (acc, item) => acc + (item.product?.price || 0) * item.quantity,
    0,
  );
  const shipping = subtotal > 10000000 ? 0 : 500000; // Miễn phí vận chuyển cho đơn hàng trên 10 triệu

  const total = subtotal + shipping;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const resolveItemProductId = (item: CartItem) => {
    if (item.product?.productId != null) {
      return String(item.product.productId);
    }
    if (item.product?.legacyId != null) {
      return String(item.product.legacyId);
    }
    if (item.productId && /^\d+$/.test(item.productId)) {
      return item.productId;
    }
    return item.product?.id ?? item.productId;
  };

  const handleCheckout = async () => {
    if (!user) {
      setOrderError('Bạn cần đăng nhập để đặt hàng.');
      router.push('/login');
      return;
    }

    if (!cart.length) {
      setOrderError('Giỏ hàng của bạn đang trống.');
      return;
    }

    if (!shippingAddress.trim()) {
      setOrderError('Vui lòng nhập địa chỉ giao hàng.');
      return;
    }

    try {
      setOrderError(null);
      const orderItemsPayload = cart.map((item) => {
        const resolvedProductId = resolveItemProductId(item);
        const numericProductId =
          resolvedProductId && /^\d+$/.test(resolvedProductId) ? resolvedProductId : null;

        return {
          cartItemId: item.id,
          productId: numericProductId ?? resolvedProductId ?? null,
          numericProductId,
          sourceId: item.productId,
          productName: item.product?.name,
          quantity: item.quantity,
          unitPrice: item.product?.price ?? 0,
          lineTotal: (item.product?.price ?? 0) * item.quantity,
        };
      });
      const orderItemsInput = orderItemsPayload.map((item) => ({
        productId: item.numericProductId ?? item.productId ?? item.sourceId,
        quantity: item.quantity,
      }));

      const result = await createOrderMutation({
        variables: {
          input: {
            items: orderItemsInput,
            shippingAddress: shippingAddress.trim(),
            paymentMethod,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
            note: note.trim() || undefined,
          },
        },
      });
      const createdOrder = result.data?.createOrder;

      const primaryProductId =
        orderItemsPayload.find((item) => item.numericProductId)?.numericProductId ??
        orderItemsPayload[0]?.productId ??
        null;

      void logInteraction({
        eventType: 'purchase',
        userId: user.id,
        productId: primaryProductId,
        metadata: {
          orderId: createdOrder?.id,
          totalAmount: createdOrder?.totalAmount ?? total,
          paymentMethod,
          paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
          shippingFee: shipping,
          itemCount: orderItemsPayload.length,
          items: orderItemsPayload,
          primaryNumericProductId: primaryProductId,
          shippingAddressProvided: Boolean(shippingAddress.trim()),
          noteProvided: Boolean(note.trim()),
        },
      });

      await clearCart();
      setOrderSuccess(true);
      setTimeout(() => {
        router.push('/account?tab=orders');
      }, 1000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      setOrderError(message);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground mb-6" />
        <h1 className="font-headline text-4xl font-bold">Giỏ Hàng Của Bạn Đang Trống</h1>
        <p className="mt-2 text-lg text-muted-foreground">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/products">Tiếp Tục Mua Sắm</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="font-headline text-4xl font-bold mb-8">Giỏ Hàng</h1>
      <div className="grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex items-center gap-4 border p-4 rounded-lg bg-card">
              <Image
                src={item.product?.image || '/images/placeholder.png'}
                alt={item.product?.name || 'Sản phẩm'}
                width={100}
                height={100}
                className="object-cover rounded-md"
                unoptimized={!item.product?.image}
              />
              <div className="flex-grow">
                <Link
                  href={item.product?.id ? `/products/${item.product.id}` : '#'}
                  className="font-bold hover:text-primary"
                >
                  {item.product?.name}
                </Link>
                <p className="text-sm text-primary font-semibold">
                  {formatPrice(item.product?.price || 0)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span>{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </p>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive mt-2" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
          ))}
          <div className="text-right mt-4">
                <Button variant="outline" onClick={clearCart}>Xóa Giỏ Hàng</Button>
              </div>
        </div>

        <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 bg-secondary rounded-lg shadow-sm">
                <h2 className="font-headline text-2xl font-bold mb-4">Tóm Tắt Đơn Hàng</h2>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span>Tạm tính</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Phí vận chuyển</span>
                        <span>{shipping > 0 ? formatPrice(shipping) : 'Miễn phí'}</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span>{formatPrice(total)}</span>
                    </div>
                </div>
                <div className="mt-6 space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Địa chỉ giao hàng</h3>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={3}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Ví dụ: 123 Nguyễn Huệ, Q.1, TP.HCM"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="payment-method"
                        className="block font-medium mb-2"
                      >
                        Phương thức thanh toán
                      </label>
                      <select
                        id="payment-method"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as 'paid_online' | 'cod')}
                      >
                        <option value="paid_online">Thanh toán trực tuyến</option>
                        <option value="cod">Thanh toán khi nhận hàng</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Ghi chú</h3>
                      <textarea
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        rows={2}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Lưu ý cho đơn hàng (tùy chọn)"
                      />
                    </div>
                    {orderError && (
                      <p className="text-sm text-destructive">{orderError}</p>
                    )}
                    {orderSuccess && (
                      <p className="text-sm text-emerald-600">
                        Đặt hàng thành công! Đang chuyển đến trang đơn hàng của bạn.
                      </p>
                    )}
                </div>
                <Button
                  size="lg"
                  className="w-full mt-6"
                  onClick={handleCheckout}
                  disabled={creatingOrder}
                >
                    {creatingOrder ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
