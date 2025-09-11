import Link from 'next/link';
import { Sofa, Youtube, Facebook, Instagram, Twitter } from 'lucide-react';
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
              <Sofa className="h-8 w-8 text-primary" />
              <span className="font-headline text-2xl font-bold">Home Harmony</span>
            </Link>
            <p className="text-muted-foreground mb-2">123 Đường Thiết Kế, Thành phố Sáng Tạo, 10001</p>
            <p className="text-muted-foreground">Điện thoại: (123) 456-7890</p>
            <p className="text-muted-foreground">Email: support@homeharmony.com</p>
            <div className="mt-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.60831618671!2d-73.98842792429699!3d40.7487214713897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9a4c344df%3A0x4a0b32815461b173!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="150"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-md"
              ></iframe>
            </div>
          </div>

          {/* Column 2: Product Links */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Sản phẩm</h3>
            <ul className="space-y-2">
              <li><Link href="/products/sofas" className="text-muted-foreground hover:text-primary">Ghế Sofa</Link></li>
              <li><Link href="/products/chairs" className="text-muted-foreground hover:text-primary">Ghế</Link></li>
              <li><Link href="/products/tables" className="text-muted-foreground hover:text-primary">Bàn</Link></li>
              <li><Link href="/products/beds" className="text-muted-foreground hover:text-primary">Giường</Link></li>
              <li><Link href="/products/storage" className="text-muted-foreground hover:text-primary">Tủ kệ</Link></li>
            </ul>
          </div>

          {/* Column 3: Services & Support */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Hỗ trợ</h3>
             <ul className="space-y-2">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Về chúng tôi</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Liên hệ</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/delivery" className="text-muted-foreground hover:text-primary">Giao hàng</Link></li>
              <li><Link href="/design-consultation" className="text-muted-foreground hover:text-primary">Thiết kế nội thất</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Bản tin</h3>
            <p className="text-muted-foreground mb-4">Nhận cập nhật về hàng mới về và ưu đãi đặc biệt.</p>
            <form className="flex flex-col gap-2">
              <Input type="email" placeholder="Email của bạn" />
              <Button>Đăng ký</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Home Harmony. Bảo lưu mọi quyền.</p>
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
