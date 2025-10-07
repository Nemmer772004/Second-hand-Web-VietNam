import Link from 'next/link';
import { ShoppingBag, Youtube, Facebook, Instagram, Twitter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const SiteFooter = () => {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Logo and Address */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <ShoppingBag className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold">NovaMarket</span>
            </Link>
            <p className="text-muted-foreground mb-2">Tầng 12, NovaMall Tower, 35 Nguyễn Huệ, Quận 1, TP.HCM</p>
            <p className="text-muted-foreground">Hotline: 1900 1234</p>
            <p className="text-muted-foreground">Email: support@novamarket.vn</p>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Trung tâm phân phối toàn quốc • Hỗ trợ vận chuyển nhanh 2h tại Hà Nội & TP.HCM
              </p>
            </div>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Danh mục nổi bật</h3>
            <ul className="space-y-2">
              <li><Link href="/products?category=dien-tu" className="text-muted-foreground hover:text-primary">Điện thoại & Phụ kiện</Link></li>
              <li><Link href="/products?category=gia-dung" className="text-muted-foreground hover:text-primary">Gia dụng thông minh</Link></li>
              <li><Link href="/products?category=thoi-trang" className="text-muted-foreground hover:text-primary">Thời trang & Làm đẹp</Link></li>
              <li><Link href="/products?category=me-be" className="text-muted-foreground hover:text-primary">Mẹ & Bé</Link></li>
            </ul>
          </div>

          {/* Column 3: Services & Support */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Hỗ trợ khách hàng</h3>
             <ul className="space-y-2">
              <li><Link href="/support/orders" className="text-muted-foreground hover:text-primary">Tra cứu đơn hàng</Link></li>
              <li><Link href="/support" className="text-muted-foreground hover:text-primary">Trung tâm trợ giúp</Link></li>
              <li><Link href="/policies/shipping" className="text-muted-foreground hover:text-primary">Chính sách giao hàng</Link></li>
              <li><Link href="/policies/returns" className="text-muted-foreground hover:text-primary">Đổi trả & Bảo hành</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Giới thiệu NovaMarket</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Bản tin</h3>
            <p className="text-muted-foreground mb-4">Nhận thông báo sớm nhất về flash sale và bộ sưu tập mới.</p>
            <form className="flex flex-col gap-2">
              <Input type="email" placeholder="Email của bạn" />
              <Button>Đăng ký</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} NovaMarket. Tất cả quyền được bảo lưu.</p>
          <div className="flex items-center gap-4">
             <div className="flex gap-4">
              <Link href="#" aria-label="Youtube"><Youtube className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
              <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary" /></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
