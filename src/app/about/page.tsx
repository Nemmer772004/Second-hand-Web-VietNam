import Image from 'next/image';
import { Building, Gem, Leaf, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const timelineEvents = [
    { year: 1999, event: 'Home Harmony được thành lập với một cửa hàng duy nhất tại Thành phố Sáng tạo, với niềm đam mê dành cho nội thất đẹp và tiện dụng.' },
    { year: 2005, event: 'Khai trương phòng trưng bày lớn đầu tiên và giới thiệu dịch vụ tư vấn thiết kế tại nhà của chúng tôi.' },
    { year: 2012, event: 'Mở rộng năng lực sản xuất, khai trương nhà máy mới rộng 80.000m² tại Westland để đảm bảo kiểm soát chất lượng.' },
    { year: 2018, event: 'Ra mắt nền tảng thương mại điện tử, mang đồ nội thất Home Harmony đến với khách hàng trên toàn quốc.' },
    { year: 2024, event: 'Kỷ niệm 25 năm xuất sắc trong thiết kế, với 9 cửa hàng trên toàn quốc và một cộng đồng trực tuyến phát triển mạnh mẽ.' },
  ];

  const coreValues = [
    { icon: <Gem className="h-10 w-10 text-primary" />, title: 'Chất Lượng Thủ Công', description: 'Mỗi sản phẩm đều được chế tác để trường tồn, sử dụng vật liệu cao cấp và sự chú ý tỉ mỉ đến từng chi tiết.' },
    { icon: <Leaf className="h-10 w-10 text-primary" />, title: 'Thực Hành Bền Vững', description: 'Chúng tôi cam kết sử dụng vật liệu có nguồn gốc bền vững và quy trình sản xuất thân thiện với môi trường.' },
    { icon: <Users className="h-10 w-10 text-primary" />, title: 'Lấy Khách Hàng Làm Trung Tâm', description: 'Sự hài lòng của bạn là ưu tiên hàng đầu của chúng tôi. Chúng tôi cung cấp dịch vụ đặc biệt từ thiết kế đến giao hàng.' },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Kiến Tạo Ngôi Nhà, Xây Dựng Sự Hài Hòa</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Kể từ năm 1999, Home Harmony đã cống hiến cho nghệ thuật tạo ra không gian sống tươi đẹp. Chúng tôi tin rằng đồ nội thất không chỉ nên tiện dụng mà còn là nguồn vui và cảm hứng trong cuộc sống hàng ngày của bạn.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="relative">
          <div className="absolute left-1/2 -ml-0.5 w-0.5 h-full bg-border" aria-hidden="true"></div>
          {timelineEvents.map((item, index) => (
            <div key={item.year} className="relative mb-12">
              <div className="flex items-center">
                <div className="flex z-10 justify-center items-center w-8 h-8 bg-primary rounded-full ring-4 ring-background">
                  <Building className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex-1 pl-8">
                  <p className="font-headline text-2xl font-bold text-primary">{item.year}</p>
                </div>
              </div>
              <div className="mt-4 ml-16">
                <p className="text-muted-foreground">{item.event}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto px-4 py-24">
          <div className="text-center mb-12">
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Giá Trị Cốt Lõi Của Chúng Tôi</h2>
            <p className="mt-2 text-lg text-muted-foreground">Những nguyên tắc định hướng mọi việc chúng tôi làm.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {coreValues.map((value) => (
              <div key={value.title} className="text-center flex flex-col items-center">
                {value.icon}
                <h3 className="font-headline text-2xl font-bold mt-4">{value.title}</h3>
                <p className="mt-2 text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Nhà Máy & Đội Ngũ Của Chúng Tôi</h2>
            <p className="mt-4 text-muted-foreground">
              Nhà máy hiện đại rộng 80.000m² của chúng tôi là nơi thiết kế gặp gỡ sản xuất. Với đội ngũ nghệ nhân và nhà thiết kế lành nghề, chúng tôi đảm bảo mọi sản phẩm đều đạt tiêu chuẩn chất lượng ISO 9001. Chúng tôi tự hào xuất khẩu đồ nội thất của mình ra thị trường quốc tế, một minh chứng cho cam kết về sự xuất sắc.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg">
                <Link href="/contact">Liên Hệ</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/design-consultation">Khám Phá Các Dự Án</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="https://picsum.photos/seed/factory/800/600" 
              alt="Nhà máy Home Harmony" 
              fill 
              className="object-cover"
              data-ai-hint="furniture factory"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
