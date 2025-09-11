import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { products, inspirationCategories, heroSlides } from '@/lib/data';
import ProductCard from '@/components/products/product-card';
import { Input } from '@/components/ui/input';

export default function Home() {
  const newProducts = products.slice(0, 8);

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32">
      <section aria-labelledby="hero-heading">
        <Carousel
          opts={{
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {heroSlides.map((slide, index) => (
              <CarouselItem key={index}>
                <div className="relative h-[60vh] md:h-[80vh] w-full">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    data-ai-hint={slide.hint}
                  />
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-primary-foreground p-4">
                    <h1 id="hero-heading" className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold drop-shadow-lg">
                      {slide.title}
                    </h1>
                    <p className="mt-4 max-w-xl text-lg md:text-xl drop-shadow">
                      {slide.subtitle}
                    </p>
                    <Button asChild size="lg" className="mt-8 transition-transform hover:scale-105">
                      <Link href={slide.link}>
                        {slide.cta} <ArrowRight className="ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground bg-white/20 hover:bg-white/40 border-none" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-foreground bg-white/20 hover:bg-white/40 border-none" />
        </Carousel>
      </section>

      <section aria-labelledby="new-products-heading" className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="new-products-heading" className="font-headline text-3xl md:text-4xl font-bold">New Products</h2>
          <p className="mt-2 text-lg text-muted-foreground">Discover our latest collection of handcrafted furniture.</p>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" variant="outline">
            <Link href="/products">View All Products</Link>
          </Button>
        </div>
      </section>
      
      <section aria-labelledby="brand-intro-heading" className="relative h-[500px] bg-fixed bg-cover bg-center" style={{backgroundImage: "url('https://picsum.photos/seed/brandintro/1920/1080')"}} data-ai-hint="showroom background">
        <div className="absolute inset-0 bg-secondary/80" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center p-8 max-w-3xl bg-background/90 rounded-lg shadow-xl mx-4">
            <h2 id="brand-intro-heading" className="font-headline text-3xl md:text-4xl font-bold">Crafting Homes Since 1999</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              With over two decades of experience, Home Harmony brings you furniture that blends timeless design with modern living. Our commitment to quality and sustainability is at the heart of everything we create.
            </p>
            <Button asChild size="lg" className="mt-6">
              <Link href="/about">Learn More About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="inspiration-heading" className="container mx-auto px-4">
        <div className="text-center">
          <h2 id="inspiration-heading" className="font-headline text-3xl md:text-4xl font-bold">Find Your Inspiration</h2>
          <p className="mt-2 text-lg text-muted-foreground">Explore curated design ideas for every room in your home.</p>
        </div>
        <Carousel
          opts={{
            align: 'start',
          }}
          className="w-full mt-12"
        >
          <CarouselContent>
            {inspirationCategories.map((category, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <Link href={category.href} className="group block">
                  <div className="overflow-hidden rounded-lg">
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={600}
                      height={400}
                      className="w-full h-auto object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={category.hint}
                    />
                  </div>
                  <h3 className="font-headline text-2xl mt-4 group-hover:text-primary">{category.name}</h3>
                  <p className="mt-1 text-muted-foreground">{category.description}</p>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </section>

      <section aria-labelledby="newsletter-heading" className="bg-secondary">
        <div className="container mx-auto px-4 py-16 text-center">
           <h2 id="newsletter-heading" className="font-headline text-3xl font-bold">Stay in the Loop</h2>
           <p className="mt-2 text-lg text-muted-foreground">Subscribe to our newsletter for exclusive offers and design tips.</p>
           <form className="mt-6 max-w-md mx-auto flex gap-2">
            <div className="relative flex-grow">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input type="email" placeholder="Enter your email" className="pl-10 h-12" />
            </div>
             <Button type="submit" size="lg" className="h-12">Subscribe</Button>
           </form>
        </div>
      </section>
    </div>
  );
}
