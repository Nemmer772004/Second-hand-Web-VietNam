'use client';

import { useState } from 'react';
import { User, LogOut, ShoppingBag, Heart, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { signOut, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
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
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWishlist } from '@/context/wishlist-context';
import Image from 'next/image';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { wishlist, removeFromWishlist } = useWishlist();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    router.push('/login');
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
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
        await updateProfile(user, {
            displayName: displayName
        });
        // Note: Updating phone number requires more complex verification and is not directly supported via updateProfile.
        // This is a simplified example. For a real app, you'd use a more robust phone verification flow.
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

  const orders = [
    { id: 'ORD-12345', date: '2024-05-20', total: 1249.98, status: 'Đã giao' },
    { id: 'ORD-12332', date: '2024-04-12', total: 349.99, status: 'Đã hoàn thành' },
    { id: 'ORD-12318', date: '2024-03-01', total: 799.99, status: 'Đã hoàn thành' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div>
            <h2 className="font-headline text-2xl font-bold mb-4">Hồ Sơ Của Tôi</h2>
            <div className="space-y-4">
              <p><strong>Tên:</strong> {user.displayName || 'N/A'}</p>
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
            <h2 className="font-headline text-2xl font-bold mb-4">Đơn Hàng Của Tôi</h2>
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-bold">Đơn hàng #{order.id}</p>
                    <p className="text-sm text-muted-foreground">Ngày: {order.date}</p>
                    <p className="text-sm text-muted-foreground">Tổng: ${order.total.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded-md">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
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
                    <Image src={item.images[0]} alt={item.name} width={80} height={80} className="w-20 h-20 object-cover rounded-md" />
                    <div className="flex-grow">
                        <Link href={`/products/${item.id}`} className="font-bold hover:underline">{item.name}</Link>
                        <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
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
      <div className="text-center mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Tài Khoản Của Tôi</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        <aside className="md:col-span-1">
          <nav className="flex flex-col space-y-2">
            <Button variant={activeTab === 'profile' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('profile')} className="justify-start gap-3"><User /> Hồ sơ</Button>
            <Button variant={activeTab === 'orders' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('orders')} className="justify-start gap-3"><ShoppingBag /> Đơn hàng</Button>
            <Button variant={activeTab === 'wishlist' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('wishlist')} className="justify-start gap-3"><Heart /> Yêu thích</Button>
            <Button variant={activeTab === 'settings' ? 'secondary' : 'ghost'} onClick={() => setActiveTab('settings')} className="justify-start gap-3"><Settings /> Cài đặt</Button>
            <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive" onClick={handleLogout}><LogOut /> Đăng xuất</Button>
          </nav>
        </aside>

        <main className="md:col-span-3">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
