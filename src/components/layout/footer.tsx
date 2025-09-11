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
              <span className="font-headline text-2xl font-bold">Đồ Cũ Thiên Tiến</span>
            </Link>
            <p className="text-muted-foreground mb-2">Số 150 Ngõ 1277 Giải Phóng, Hoàng Mai, Hà Nội</p>
            <p className="text-muted-foreground">Điện thoại: 0984115339</p>
            <p className="text-muted-foreground">Email: docuthientien@gmail.com</p>
            <div className="mt-4">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.399516641571!2d105.84369417594043!3d20.97693528066224!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac5dfa705a39%3A0x8d3132e407f35319!2zMTIzMiDEkC4gR2nhuqNpIFBow7NuZywgSG_DoG5nIE1haSwgSMOgIE7hu5lpLCBWaeG7h3QgTmFt!5e0!3m2!1svi!2s!4v1719213898090!5m2!1svi!2s"
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
              <li><Link href="/products?category=do-dien-lanh" className="text-muted-foreground hover:text-primary">Đồ Điện Lạnh Cũ</Link></li>
              <li><Link href="/products?category=do-nha-hang" className="text-muted-foreground hover:text-primary">Đồ Nhà Hàng Cũ</Link></li>
              <li><Link href="/products?category=do-van-phong" className="text-muted-foreground hover:text-primary">Đồ Văn Phòng Cũ</Link></li>
              <li><Link href="/products?category=do-gia-dinh" className="text-muted-foreground hover:text-primary">Đồ Gia Đình Cũ</Link></li>
            </ul>
          </div>

          {/* Column 3: Services & Support */}
          <div>
            <h3 className="font-headline text-lg font-bold mb-4">Dịch vụ & Hỗ trợ</h3>
             <ul className="space-y-2">
              <li><Link href="/services/thu-mua" className="text-muted-foreground hover:text-primary">Thu Mua Đồ Cũ</Link></li>
              <li><Link href="/services/setup-nha-hang" className="text-muted-foreground hover:text-primary">Setup Nhà Hàng</Link></li>
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">Về chúng tôi</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Liên hệ</Link></li>
              <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
              <li><Link href="/delivery" className="text-muted-foreground hover:text-primary">Giao hàng & Đổi trả</Link></li>
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
          <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} Đồ Cũ Thiên Tiến. Bảo lưu mọi quyền.</p>
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
