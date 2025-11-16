"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useCurrentUser } from "@/lib/auth";
import { fetchJson, getAuthToken, setAuthToken } from "@/lib/api";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useCurrentUser();
  const profileRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    try {
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('babyfiction_demo_user');
      }
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    const syncCounts = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const [cartRes, wishRes]: any = await Promise.all([
            fetchJson('/api/cart/count'),
            fetchJson('/api/wishlist/count')
          ]);
          setCartCount(typeof cartRes?.count === 'number' ? cartRes.count : 0);
          setWishlistCount(typeof wishRes?.count === 'number' ? wishRes.count : 0);
        } else {
          setCartCount(0);
          setWishlistCount(0);
        }
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
    
    // Click outside to close profile dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener('bf_cart_updated', onCartUpdated as EventListener);
      window.removeEventListener('bf_wishlist_updated', onWishlistUpdated as EventListener);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuLinks = [
    { name: "Featured", path: "/catalog" },
    { name: "Hoodies", path: "/catalog?category=hoodies" },
    { name: "T-shirts", path: "/catalog?category=shirts" },
    { name: "Hats", path: "/catalog?category=hats" },
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];

  const mainNavLinks = [
    { name: "Home", path: "/" },
    { name: "Collections", path: "/catalog" },
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-sm shadow-sm"
          : "bg-white"
      }`}
    >
      <div className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-24 md:h-28">
          {/* Left: Hamburger Menu + Navigation Links */}
          <div className="flex items-center gap-8 lg:gap-12">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity"
              aria-label="Menu"
            >
              <Image
                src="/assets/images/icons/navbar/hamburger-menu-btn.svg"
                alt="Menu"
                width={28}
                height={28}
              />
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
              {mainNavLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-base lg:text-lg font-[family-name:var(--font-nav)] uppercase tracking-wider text-gray-800 hover:text-black transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Center: Logo */}
          <Link
            href="/"
            className="absolute left-1/2 transform -translate-x-1/2 text-2xl md:text-3xl font-[family-name:var(--font-logo)] tracking-tight"
          >
            BabyFictions
          </Link>

          {/* Right: Action Icons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity relative"
              aria-label="Shopping Cart"
            >
              <Image
                src="/assets/images/icons/navbar/shopping-cart-icon.svg"
                alt="Cart"
                width={28}
                height={28}
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-[family-name:var(--font-body)] font-medium">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/wishlist"
              className="w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity relative"
              aria-label="Wishlist"
            >
              <Image
                src="/assets/images/icons/navbar/wishlist-icon.svg"
                alt="Wishlist"
                width={28}
                height={28}
              />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 min-w-[20px] px-1 flex items-center justify-center font-[family-name:var(--font-body)] font-medium">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Profile Icon with Dropdown */}
            <div ref={profileRef} className="relative">
              <button
                onMouseEnter={() => setProfileOpen(true)}
                className="w-12 h-12 flex items-center justify-center hover:opacity-70 transition-opacity"
                aria-label="Profile"
              >
                <Image
                  src="/assets/images/icons/navbar/profile.svg"
                  alt="Profile"
                  width={28}
                  height={28}
                />
              </button>

              {/* Profile Dropdown */}
              {profileOpen && (
                <div
                  onMouseEnter={() => setProfileOpen(true)}
                  onMouseLeave={() => setProfileOpen(false)}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 animate-fade-in"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-[family-name:var(--font-body)] font-medium text-gray-900">
                          Hello, {user.name || user.email?.split('@')[0]}
                        </p>
                      </div>
                      <Link
                        href={user.role === 'admin' ? '/admin' : '/account'}
                        onClick={() => setProfileOpen(false)}
                        className="block px-4 py-2 text-sm font-[family-name:var(--font-body)] text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        {user.role === 'admin' ? 'Dashboard' : 'My Account'}
                      </Link>
                      {user.role === 'driver' && (
                        <Link
                          href="/driver"
                          onClick={() => setProfileOpen(false)}
                          className="block px-4 py-2 text-sm font-[family-name:var(--font-body)] text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Driver Portal
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setProfileOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm font-[family-name:var(--font-body)] text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        Log Out
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-sm font-[family-name:var(--font-body)] text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Login
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile/Collapsible Menu */}
      {mobileOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg animate-slide-in">
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col gap-4">
              {menuLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-base font-[family-name:var(--font-nav)] uppercase tracking-wider text-gray-800 hover:text-black transition-colors py-2"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
