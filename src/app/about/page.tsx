import Image from 'next/image';
import { Building, Gem, Leaf, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
  const timelineEvents = [
    { year: 1999, event: 'Home Harmony was founded with a single store in Creativity City, with a passion for beautiful, functional furniture.' },
    { year: 2005, event: 'Opened our first large-format showroom and introduced our in-house design consultation service.' },
    { year: 2012, event: 'Expanded our manufacturing capabilities, opening a new 80,000m² factory in Westland to ensure quality control.' },
    { year: 2018, event: 'Launched our e-commerce platform, bringing Home Harmony furniture to customers nationwide.' },
    { year: 2024, event: 'Celebrated 25 years of design excellence, with 9 stores across the country and a thriving online community.' },
  ];

  const coreValues = [
    { icon: <Gem className="h-10 w-10 text-primary" />, title: 'Quality Craftsmanship', description: 'Every piece is built to last, using premium materials and meticulous attention to detail.' },
    { icon: <Leaf className="h-10 w-10 text-primary" />, title: 'Sustainable Practices', description: 'We are committed to using sustainably sourced materials and eco-friendly manufacturing processes.' },
    { icon: <Users className="h-10 w-10 text-primary" />, title: 'Customer-Centric', description: 'Your satisfaction is our priority. We provide exceptional service from design to delivery.' },
  ];

  return (
    <div className="flex flex-col gap-16 sm:gap-24 md:gap-32 py-12">
      <section className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Crafting Homes, Building Harmony</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Since 1999, Home Harmony has been dedicated to the art of creating beautiful living spaces. We believe that furniture should not only be functional but also a source of joy and inspiration in your daily life.
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
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Core Values</h2>
            <p className="mt-2 text-lg text-muted-foreground">The principles that guide everything we do.</p>
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
            <h2 className="font-headline text-3xl md:text-4xl font-bold">Our Factory & Team</h2>
            <p className="mt-4 text-muted-foreground">
              Our state-of-the-art 80,000m² factory is where design meets production. Staffed by skilled artisans and designers, we ensure every product meets ISO 9001 quality standards. We proudly export our furniture to international markets, a testament to our commitment to excellence.
            </p>
            <div className="mt-8 flex gap-4">
              <Button asChild size="lg">
                <Link href="/contact">Contact Us</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/design-consultation">Explore Our Projects</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <Image 
              src="https://picsum.photos/seed/factory/800/600" 
              alt="Home Harmony Factory" 
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
