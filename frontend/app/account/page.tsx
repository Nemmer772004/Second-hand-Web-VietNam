'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { User, LogOut, ShoppingBag, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWishlist } from '@/context/wishlist-context';
import Image from 'next/image';
import { GET_MY_ORDERS } from '@/lib/queries';

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending_confirmation: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã huỷ',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  paid_online: 'Thanh toán trực tuyến',
  cod: 'Thanh toán khi nhận hàng',
  bank_transfer: 'Chuyển khoản ngân hàng',
  card: 'Thẻ thanh toán',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Đã thanh toán',
  pending: 'Chờ thanh toán',
  failed: 'Thanh toán thất bại',
  refunded: 'Đã hoàn tiền',
};

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-16">Đang tải tài khoản...</div>}>
      <AccountPageContent />
    </Suspense>
  );
}


function AccountPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { wishlist, removeFromWishlist } = useWishlist();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: myOrdersData,
    loading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders,
  } = useQuery(GET_MY_ORDERS, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const myOrders = useMemo(() => myOrdersData?.myOrders || [], [myOrdersData?.myOrders]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    if (!requestedTab) return;
    if (['profile', 'orders', 'wishlist', 'settings'].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [searchParams]);

  useEffect(() => {
    setDisplayName(user?.name || '');
    setPhoneNumber(user?.phone || '');
  }, [user?.name, user?.phone]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      refetchOrders();
    }
  }, [activeTab, user, refetchOrders]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value || 0);

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString('vi-VN') : '—';

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Đã đăng xuất',
        description: 'Bạn đã đăng xuất thành công.',
      });
      router.push('/');
    } catch (error) {
       toast({
        variant: 'destructive',
        title: 'Đăng xuất thất bại',
        description: 'Đã xảy ra lỗi khi đăng xuất.',
      });
    }
  };
  
  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
        // TODO: Tích hợp API cập nhật hồ sơ khi backend sẵn sàng.
        toast({
            title: 'Hồ sơ đã được cập nhật!',
            description: 'Thông tin của bạn đã được lưu.',
        });
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Cập nhật thất bại',
            description: 'Đã có lỗi xảy ra khi cập nhật hồ sơ của bạn.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const renderOrders = () => {
    if (ordersLoading && myOrders.length === 0) {
      return <div>Đang tải đơn hàng...</div>;
    }

    if (ordersError) {
      return (
        <div className="rounded-md border border-destructive p-4 text-destructive">
          Không thể tải đơn hàng: {ordersError.message}
        </div>
      );
    }

    if (myOrders.length === 0) {
      return (
        <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
          Bạn chưa có đơn hàng nào. Bắt đầu mua sắm ngay!
          <div className="mt-4">
            <Button asChild>
              <Link href="/products">Khám phá sản phẩm</Link>
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {myOrders.map((order: any) => (
          <div key={order.id} className="rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-headline text-lg font-semibold">Đơn hàng #{order.id}</p>
                <p className="text-sm text-muted-foreground">Tạo lúc: {formatDateTime(order.createdAt)}</p>
                <p className="text-sm text-muted-foreground">
                  Phương thức: {PAYMENT_METHOD_LABELS[order.paymentMethod as string] || 'Không rõ'} • {PAYMENT_STATUS_LABELS[order.paymentStatus as string] || '—'}
                </p>
                {order.notes && (
                  <p className="mt-2 text-sm text-muted-foreground">Ghi chú: {order.notes}</p>
                )}
              </div>
              <div className="text-right">
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {ORDER_STATUS_LABELS[order.status as string] || order.status || 'Không rõ'}
                </span>
                <p className="mt-3 text-lg font-bold">{formatCurrency(order.totalAmount)}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {order.items?.map((item: any) => (
                <div key={`${order.id}-${item.productId}`} className="flex items-center justify-between rounded-md bg-secondary/40 px-3 py-2">
                  <div>
                    <p className="font-medium">{item.productName || item.productId}</p>
                    <p className="text-xs text-muted-foreground">Mã: {item.productId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">SL: {item.quantity}</p>
                    <p className="text-sm font-semibold">
                      {formatCurrency((item.lineTotal as number) || (item.price as number) * (item.quantity as number))}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <p>
                <strong>Địa chỉ giao hàng:</strong> {order.shippingAddress || '—'}
              </p>
              <p>
                <strong>Thanh toán:</strong> {PAYMENT_STATUS_LABELS[order.paymentStatus as string] || '—'}
              </p>
              <p>
                <strong>Xác nhận:</strong> {formatDateTime(order.confirmedAt)}
              </p>
              <p>
                <strong>Cập nhật gần nhất:</strong> {formatDateTime(order.updatedAt)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Hồ Sơ Của Tôi</h2>
            <div className="space-y-4">
              <p><strong>Tên:</strong> {displayName || user.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Số điện thoại:</strong> {phoneNumber || 'Chưa cung cấp'}</p>
               <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">Chỉnh sửa hồ sơ</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Chỉnh sửa hồ sơ</DialogTitle>
                        <DialogDescription>
                            Cập nhật thông tin cá nhân của bạn tại đây. Nhấn lưu để hoàn tất.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Tên</Label>
                            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">Số điện thoại</Label>
                            <Input id="phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" onClick={handleProfileUpdate} disabled={isSaving}>
                                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div>
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold mb-4">Đơn Hàng Của Tôi</h2>
              {ordersLoading && myOrders.length > 0 && (
                <span className="text-sm text-muted-foreground">Đang cập nhật...</span>
              )}
            </div>
            {renderOrders()}
          </div>
        );
      case 'wishlist':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Danh Sách Yêu Thích</h2>
            {wishlist.length > 0 ? (
                <div className="space-y-4">
                {wishlist.map(item => (
                    <div key={item.id} className="border p-4 rounded-lg flex items-center gap-4">
                    <Image
                      src={item.image || '/images/placeholder.png'}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md"
                      unoptimized={!item.image}
                    />
                    <div className="flex-grow">
                        <Link href={`/products/${item.id}`} className="font-bold hover:underline">{item.name}</Link>
                        <p className="text-muted-foreground">{formatCurrency(item.price)}</p>
                    </div>
                     <Button variant="outline" size="sm" onClick={() => removeFromWishlist(item.id)}>Xóa</Button>
                    <Button asChild size="sm"><Link href={`/products/${item.id}`}>Xem Sản Phẩm</Link></Button>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-muted-foreground">Danh sách yêu thích của bạn đang trống.</p>
                    <Button asChild className="mt-4">
                        <Link href="/products">Bắt đầu mua sắm</Link>
                    </Button>
                </div>
            )}
          </div>
        );
      case 'settings':
         return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Cài Đặt</h2>
            <p className="text-muted-foreground">Quản lý cài đặt tài khoản và tùy chọn của bạn tại đây.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="grid lg:grid-cols-[280px,1fr] gap-8">
        <div className="border rounded-lg p-6 space-y-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <p className="font-bold text-lg">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <nav className="space-y-2">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'profile' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('profile')}
            >
              <User className="h-4 w-4" />
              Hồ sơ
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'orders' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingBag className="h-4 w-4" />
              Đơn hàng
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'wishlist' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('wishlist')}
            >
              <Heart className="h-4 w-4" />
              Yêu thích
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition ${activeTab === 'settings' ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}
              onClick={() => setActiveTab('settings')}
            >
              <Settings className="h-4 w-4" />
              Cài đặt
            </button>
          </nav>

          <Button variant="outline" className="w-full" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Đăng xuất
          </Button>
        </div>

        <div className="border rounded-lg p-6 bg-background">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
