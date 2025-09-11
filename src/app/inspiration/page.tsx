
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
        description: 'Hãy cho chúng tôi biết về ý tưởng của bạn.',
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
    { src: "https://picsum.photos/seed/gallery1/600/800", alt: "Setup quán cafe với bàn ghế cũ", hint: "cafe setup used furniture" },
    { src: "https://picsum.photos/seed/gallery2/600/800", alt: "Bếp nhà hàng sử dụng thiết bị inox cũ", hint: "restaurant kitchen used equipment" },
    { src: "https://picsum.photos/seed/gallery3/600/800", alt: "Văn phòng làm việc với nội thất thanh lý", hint: "office used furniture" },
    { src: "https://picsum.photos/seed/gallery4/600/800", alt: "Quầy bar độc đáo từ gỗ tái chế", hint: "recycled wood bar" },
    { src: "https://picsum.photos/seed/gallery5/600/800", alt: "Tủ mát trưng bày trong cửa hàng tiện lợi", hint: "convenience store cooler" },
    { src: "https://picsum.photos/seed/gallery6/600/800", alt: "Không gian quán ăn nhỏ ấm cúng", hint: "cozy small restaurant" },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 py-12">
      <section className="container mx-auto px-4 text-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold">Góc Cảm Hứng</h1>
        <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
          Khám phá các ý tưởng setup nhà hàng, văn phòng và không gian sống từ những sản phẩm đã qua sử dụng. Biến đồ cũ thành không gian mới đầy sáng tạo và tiết kiệm.
        </p>
      </section>

      <section className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-center mb-12">Ý Tưởng Setup</h2>
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
                <h2 className="font-headline text-3xl md:text-4xl font-bold mt-4">Trợ Lý Thiết Kế AI</h2>
                <p className="mt-2 text-lg text-muted-foreground">
                    Mô tả ý tưởng của bạn (ví dụ: 'setup quán phở nhỏ', 'văn phòng cho 10 người'), AI sẽ gợi ý các thiết bị cần thiết.
                </p>
                <div className="mt-8 flex gap-2">
                    <Input 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="ví dụ: 'cần đồ cho quán cafe nhỏ 20m2'" 
                        className="h-12"
                    />
                    <Button size="lg" onClick={handleRecommendation} disabled={loading} className="h-12">
                        {loading ? 'Đang tạo...' : 'Lấy ý tưởng'}
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
