'use client';

import { useContext } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartContext } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useContext(CartContext);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 15; // Logic phí vận chuyển ví dụ

  const total = subtotal + shipping;

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
            <div key={item.id} className="flex items-center gap-4 border p-4 rounded-lg">
              <Image src={item.images[0]} alt={item.name} width={100} height={100} className="object-cover rounded-md" />
              <div className="flex-grow">
                <Link href={`/products/${item.id}`} className="font-bold hover:underline">{item.name}</Link>
                <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
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
                <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
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
            <div className="sticky top-24 p-6 bg-secondary rounded-lg">
                <h2 className="font-headline text-2xl font-bold mb-4">Tóm Tắt Đơn Hàng</h2>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span>Tạm tính</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>Phí vận chuyển</span>
                        <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : 'Miễn phí'}</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="font-medium mb-2">Mã Khuyến Mãi</h3>
                    <div className="flex gap-2">
                        <Input placeholder="Nhập mã" />
                        <Button variant="outline">Áp dụng</Button>
                    </div>
                </div>
                <Button size="lg" className="w-full mt-6">
                    Tiến Hành Thanh Toán
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
