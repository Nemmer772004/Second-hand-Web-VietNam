"use client";

import * as React from "react";
import Link from "next/link";
import { useState, useContext, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { productCategories } from "@/lib/data";
import Image from "next/image";
import { CartContext } from "@/context/cart-context";
import { Badge } from "@/components/ui/badge";
import { useWishlist } from "@/context/wishlist-context";

const SiteHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { cart } = useContext(CartContext);
  const { wishlist } = useWishlist();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
  };

  const menuItems = [
    {
      name: "Dịch Vụ",
      subItems: [
        { name: "Thu Mua Đồ Cũ", href: "/services/thu-mua" },
        { name: "Setup Nhà Hàng", href: "/services/setup-nha-hang" },
      ],
    },
    { name: "Cảm Hứng", href: "/inspiration" },
    { name: "Về Chúng Tôi", href: "/about" },
    { name: "Liên Hệ", href: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Mobile Menu Trigger */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-4">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Mở menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <MobileNav
                closeMenu={() => setIsMobileMenuOpen(false)}
                menuItems={menuItems}
              />
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-4 lg:mr-8">
            <Sofa className="h-7 w-7 text-primary" />
            <span className="font-headline text-2xl font-bold hidden sm:inline-block">
              Đồ Cũ
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Sản Phẩm</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[600px] grid-cols-3 gap-4 p-4">
                    <li className="col-span-1 flex flex-col">
                      <h3 className="font-headline text-lg mb-2">
                        Mua sắm theo danh mục
                      </h3>
                      {productCategories.map((category) => (
                        <ListItem
                          key={category.name}
                          href={category.href}
                          title={category.name}
                        />
                      ))}
                      <Link
                        href="/products"
                        className="p-2 mt-2 rounded-md bg-secondary text-secondary-foreground font-medium block text-sm"
                      >
                        Xem tất cả sản phẩm
                      </Link>
                    </li>
                    <li className="col-span-2 relative h-full w-full overflow-hidden rounded-md">
                      <Image
                        src="https://picsum.photos/seed/nav/600/400"
                        alt="Thiết bị nhà hàng cũ"
                        fill
                        className="object-cover"
                        data-ai-hint="used restaurant equipment"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-primary-foreground">
                        <h4 className="font-bold">Hàng Mới Về</h4>
                        <p className="text-sm">Tủ lạnh công nghiệp, bếp á...</p>
                      </div>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              {menuItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  {item.subItems ? (
                    <>
                      <NavigationMenuTrigger>{item.name}</NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          {item.subItems.map((sub) => (
                            <ListItem
                              key={sub.name}
                              href={sub.href}
                              title={sub.name}
                            />
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={item.href || '#'} passHref legacyBehavior>
                       <NavigationMenuLink asChild>
                         <a className={navigationMenuTriggerStyle()}>
                          {item.name}
                        </a>
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="hidden lg:flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <a href="tel:0984115339" className="font-bold text-sm">
                0984115339
              </a>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Tìm kiếm"
                  className="lg:hidden"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tìm kiếm sản phẩm</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSearch} className="flex relative w-full">
                  <Input
                    type="search"
                    placeholder="Tìm tủ lạnh cũ, bàn ghế nhà hàng..."
                    className="pr-10 h-12"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10"
                  >
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <form
              onSubmit={handleSearch}
              className="hidden lg:flex relative w-full max-w-xs"
            >
              <Input
                type="search"
                placeholder="Tìm tủ lạnh cũ, bàn ghế..."
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              >
                <Search className="h-full w-full" />
              </button>
            </form>

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/account#wishlist" aria-label="Danh sách yêu thích">
                  <Heart className="h-5 w-5" />
                  {wishlist.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0"
                    >
                      {wishlist.length}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link href="/cart" aria-label="Giỏ hàng">
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0"
                    >
                      {cart.reduce((acc, item) => acc + item.quantity, 0)}
                    </Badge>
                  )}
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account" aria-label="Tài khoản người dùng">
                  <User className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileNav = ({
  closeMenu,
  menuItems,
}: {
  closeMenu: () => void;
  menuItems: any[];
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <Link href="/" className="flex items-center gap-2" onClick={closeMenu}>
          <Sofa className="h-7 w-7 text-primary" />
          <span className="font-headline text-xl font-bold">Đồ Cũ</span>
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
                Sản Phẩm{" "}
                <ChevronDown className="h-4 w-4 transition-transform duration-200" />
              </summary>
              <ul className="pl-4 mt-2 space-y-2">
                {productCategories.map((category) => (
                  <li key={category.name}>
                    <Link
                      href={category.href}
                      className="block py-2 text-muted-foreground hover:text-primary"
                      onClick={closeMenu}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/products"
                    className="block py-2 font-medium"
                    onClick={closeMenu}
                  >
                    Tất cả sản phẩm
                  </Link>
                </li>
              </ul>
            </details>
          </li>
          {menuItems.map((item) => (
            <li key={item.name}>
              {item.subItems ? (
                <details>
                  <summary className="flex items-center justify-between py-2 font-medium cursor-pointer list-none">
                    {item.name}{" "}
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  </summary>
                  <ul className="pl-4 mt-2 space-y-2">
                    {item.subItems.map((sub: any) => (
                      <li key={sub.name}>
                        <Link
                          href={sub.href}
                          className="block py-2 text-muted-foreground hover:text-primary"
                          onClick={closeMenu}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : (
                <Link
                  href={item.href || "#"}
                  className="block py-2 font-medium"
                  onClick={closeMenu}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <span>Hotline: 0984115339</span>
        </div>
      </div>
    </div>
  );
};

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<typeof Link> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          {...props}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export default SiteHeader;
