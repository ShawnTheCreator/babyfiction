"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const pathname = usePathname();
  const { user } = useCurrentUser();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    const syncCounts = () => {
      try {
        const cartRaw = typeof window !== 'undefined' ? localStorage.getItem('bf_cart') : null;
        const wishRaw = typeof window !== 'undefined' ? localStorage.getItem('bf_wishlist') : null;
        const cart = cartRaw ? JSON.parse(cartRaw) : [];
        const wish = wishRaw ? JSON.parse(wishRaw) : [];
        setCartCount(Array.isArray(cart) ? cart.length : 0);
        setWishlistCount(Array.isArray(wish) ? wish.length : 0);
      } catch {
        setCartCount(0);
        setWishlistCount(0);
      }
    };
    syncCounts();
    const onCartUpdated = () => syncCounts();
    const onWishlistUpdated = () => syncCounts();
    window.addEventListener('bf_cart_updated', onCartUpdated as EventListener);
    window.addEventListener('bf_wishlist_updated', onWishlistUpdated as EventListener);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Hats", path: "/catalog?category=hats" },
    { name: "Shirts", path: "/catalog?category=shirts" },
    { name: "Hoodies", path: "/catalog?category=hoodies" },
    { name: "Pants", path: "/catalog?category=pants" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-tighter hover:scale-105 transition-transform duration-300"
          >
            Babyfiction
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={`${link.path}-${link.name}`}
                href={link.path}
                className={`text-sm font-medium transition-all duration-300 hover:text-foreground relative group ${
                  pathname.startsWith(link.path.split("?")[0]) ? "text-foreground" : "text-foreground/80"
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-foreground transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              className="hover:bg-foreground/5 transition-all duration-300"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Auth / User display */}
            {!user ? (
              <>
                <Link href="/auth/login" className="hidden md:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Login
                </Link>
                <Link href="/auth/signup" className="hidden md:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                  Sign up
                </Link>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2 text-sm font-medium text-foreground/80">
                <User className="h-4 w-4" />
                <span>Hello, {user.name || user.email}</span>
              </div>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin" className="hidden md:inline text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Admin
              </Link>
            )}

            {/* Wishlist */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-foreground/5 transition-all duration-300"
              asChild
            >
              <Link href="#" title="Wishlist">
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-scale-in">
                  {wishlistCount}
                </span>
              </Link>
            </Button>

            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-foreground/5 transition-all duration-300"
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-scale-in">
                  {cartCount}
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-fade-in">
            <Input
              placeholder="Search products..."
              className="w-full bg-secondary/50 border-border focus-visible:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg animate-slide-in">
          <div className="flex flex-col p-6 gap-4">
            {navLinks.map((link) => (
              <Link
                key={`${link.path}-${link.name}`}
                href={link.path}
                onClick={() => setMobileOpen(false)}
                className="text-lg font-medium hover:text-foreground transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}

            <div className="mt-2 border-t pt-4 flex flex-col gap-3">
              {!user ? (
                <>
                  <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-foreground">
                    Login
                  </Link>
                  <Link href="/auth/signup" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-foreground">
                    Sign up
                  </Link>
                </>
              ) : (
                <div className="text-lg font-medium text-foreground/80">
                  Hello, {user.name || user.email}
                </div>
              )}
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileOpen(false)} className="text-lg font-medium text-foreground/80 hover:text-foreground">
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
