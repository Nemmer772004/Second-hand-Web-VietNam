"use client";

import Link from 'next/link';
import { useState } from 'react';
import {
  Sofa,
  Search,
  Heart,
  ShoppingCart,
  User,
  Phone,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { cn } from '@/lib/utils';
import { productCategories } from '@/lib/data';
import Image from 'next/image';

const SiteHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <MobileNav closeMenu={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-8">
            <Sofa className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold hidden sm:inline-block">
              Home Harmony
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Products</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[600px] grid-cols-3 gap-4 p-4">
                    <div className="col-span-1 flex flex-col">
                      <h3 className="font-headline text-lg mb-2">Categories</h3>
                      {productCategories.map((category) => (
                        <NavigationMenuLink asChild key={category.name}>
                          <Link href={category.href} className="p-2 rounded-md hover:bg-accent block text-sm">{category.name}</Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                    <div className="col-span-2 relative h-full w-full overflow-hidden rounded-md">
                      <Image
                        src="https://picsum.photos/seed/nav/600/400"
                        alt="Featured furniture"
                        fill
                        className="object-cover"
                        data-ai-hint="elegant living room"
                      />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                       <div className="absolute bottom-4 left-4 text-primary-foreground">
                        <h4 className="font-bold">New Arrivals</h4>
                        <p className="text-sm">Explore the latest trends</p>
                       </div>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/inspiration" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Inspiration
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/design-consultation" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Interior Design
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 items-center justify-end gap-4">
            {/* Search */}
            <div className="hidden lg:flex relative w-full max-w-xs">
              <Input type="search" placeholder="Search products..." className="pr-10" />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Search" className="lg:hidden">
                <Search className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Shopping Cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="User Account">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileNav = ({ closeMenu }: { closeMenu: () => void }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <Sofa className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-bold">Home Harmony</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={closeMenu}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="flex flex-col gap-2">
          <li>
            <details>
              <summary className="flex items-center justify-between py-2 font-medium cursor-pointer list-none">
                Products <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </summary>
              <ul className="pl-4 mt-2 space-y-2">
                {productCategories.map((category) => (
                   <li key={category.name}>
                     <Link href={category.href} className="block py-2 text-muted-foreground hover:text-primary" onClick={closeMenu}>{category.name}</Link>
                   </li>
                ))}
              </ul>
            </details>
          </li>
          <li>
            <Link href="/inspiration" className="block py-2 font-medium" onClick={closeMenu}>Inspiration</Link>
          </li>
          <li>
            <Link href="/design-consultation" className="block py-2 font-medium" onClick={closeMenu}>Interior Design</Link>
          </li>
          <li>
            <Link href="/about" className="block py-2 font-medium" onClick={closeMenu}>About Us</Link>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>Hotline: (123) 456-7890</span>
        </div>
      </div>
    </div>
  );
};


export default SiteHeader;
