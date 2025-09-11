
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { inspirationCategories } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { recommendFurniture } from '@/ai/flows/prompt-based-starting-point';
import { Skeleton } from '@/components/ui/skeleton';

export default function InspirationPage() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { toast } = useToast();

  const handleRecommendation = async () => {
    if (!prompt) {
      toast({
        variant: 'destructive',
        title: 'Vui lòng nhập mô tả',
        description: 'Hãy cho chúng tôi biết về phong cách bạn đang tìm kiếm.',
      });
      return;
    }
    setLoading(true);
    setRecommendations([]);
    try {
      const result = await recommendFurniture({ prompt });
      setRecommendations(result.furnitureItems);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Đã xảy ra lỗi',
        description: 'Không thể nhận đề xuất từ AI. Vui lòng thử lại.',
      });
    }
    setLoading(false);
  };
  
  const galleryImages = [
    { src: "https://picsum.photos/seed/gallery1/600/800", alt: "Thiết kế phòng khách tối giản", hint: "minimalist living room" },
    { src: "https://picsum.photos/seed/gallery2/600/800", alt: "Góc đọc sách ấm cúng", hint: "cozy reading nook" },
    { src: "https://picsum.photos/seed/gallery3/600/800", alt: "Phòng ngủ phong cách boho", hint: "bohemian bedroom" },
    { src: "https://picsum.photos/seed/gallery4/600/800", alt: "Phòng ăn sang trọng", hint: "luxury dining room" },
    { src: "https://picsum.photos/seed/gallery5/600/800", alt: "Nội thất gỗ tự nhiên", hint: "natural wood furniture" },
    { src: "https://picsum.photos/seed/gallery6/600/800", alt: "Không gian làm việc tại nhà", hint: "home office space" },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-12">
      <section className="container mx-auto px-4 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Tìm Cảm Hứng Của Bạn</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Khám phá những không gian được tuyển chọn và khám phá phong cách của bạn. Từ chủ nghĩa tối giản hiện đại đến sự ấm cúng mộc mạc, hãy để chúng tôi giúp bạn hình dung về ngôi nhà mơ ước của mình.
        </p>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">Bộ Sưu Tập Thiết Kế</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {inspirationCategories.map((category) => (
            <div key={category.name} className="group relative rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={category.image} 
                alt={category.name} 
                width={400} 
                height={500} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={category.hint}
              />
              <div className="absolute inset-0 bg-black/40 flex items-end">
                <div className="p-6 text-white">
                  <h3 className="font-headline text-2xl font-bold">{category.name}</h3>
                  <p className="text-sm mt-1">{category.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      
       <section className="bg-secondary">
        <div className="container mx-auto px-4 py-24">
            <div className="max-w-2xl mx-auto text-center">
                <Sparkles className="mx-auto h-12 w-12 text-primary" />
                <h2 className="font-headline text-3xl md:text-4xl font-bold mt-4">Cần một gợi ý?</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Hãy mô tả phong cách, căn phòng hoặc món đồ bạn đang nghĩ đến, và để AI của chúng tôi đề xuất một vài ý tưởng để bạn bắt đầu.
                </p>
                <div className="mt-8 flex gap-2">
                    <Input 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="ví dụ: 'phòng khách ấm cúng với tông màu đất'" 
                        className="h-12"
                    />
                    <Button size="lg" onClick={handleRecommendation} disabled={loading} className="h-12">
                        {loading ? 'Đang tạo...' : 'Lấy Cảm Hứng'}
                    </Button>
                </div>

                {loading && (
                    <div className="mt-8 space-y-4">
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-8 w-full rounded-md" />
                        <Skeleton className="h-8 w-2/3 mx-auto rounded-md" />
                    </div>
                )}

                {recommendations.length > 0 && (
                    <div className="mt-8">
                        <h3 className="font-headline text-2xl font-bold">Gợi ý cho bạn:</h3>
                        <div className="mt-4 flex flex-wrap justify-center gap-4">
                            {recommendations.map((item, index) => (
                                <Card key={index} className="bg-background">
                                    <CardContent className="p-4">
                                        <p className="font-medium">{item}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      </section>

      <section className="container mx-auto px-4">
         <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {galleryImages.map((img, index) => (
                <div key={index} className="overflow-hidden rounded-lg shadow-lg break-inside-avoid">
                    <Image
                        src={img.src}
                        alt={img.alt}
                        width={600}
                        height={800}
                        className="w-full h-auto object-cover"
                        data-ai-hint={img.hint}
                    />
                </div>
            ))}
        </div>
      </section>

    </div>
  );
}
