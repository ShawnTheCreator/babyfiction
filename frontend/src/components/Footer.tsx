"use client";
import Link from "next/link";
import { Instagram, Twitter, Facebook } from "lucide-react";

const Footer = () => {
  const footerLinks = {
    Shop: [
      { name: "New Arrivals", path: "/products?filter=new" },
      { name: "Best Sellers", path: "/products?filter=bestsellers" },
      { name: "Collections", path: "/products" },
      { name: "Sale", path: "/products?filter=sale" },
    ],
    Support: [
      { name: "Track Order", path: "/track" },
      { name: "Shipping", path: "/shipping" },
      { name: "Returns", path: "/returns" },
      { name: "FAQ", path: "/faq" },
    ],
    Company: [
      { name: "About", path: "/about" },
      { name: "Careers", path: "/careers" },
      { name: "Contact", path: "/contact" },
      { name: "Admin", path: "/admin" },
    ],
  };

  return (
    <footer className="bg-primary text-primary-foreground mt-20">
      <div className="max-w-[1400px] mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold tracking-tighter">Babyfiction</h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Premium fashion for the modern lifestyle. Curated collections that define elegance.
            </p>
            <div className="flex gap-4 pt-4">
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-foreground transition-colors duration-300"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{title}</h4>
              <ul className="space-y-3">
                {links.filter((item) => Boolean(item && item.path)).map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className="text-primary-foreground/70 hover:text-primary-foreground transition-colors duration-300 text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/70 text-sm">
            © 2025 Babyfiction. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
