import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/', priority: 1.0 },
    { url: '/products', priority: 0.9 },
    { url: '/cart' },
    { url: '/checkout' },
    { url: '/track' },
    { url: '/admin' },
  ];
}


