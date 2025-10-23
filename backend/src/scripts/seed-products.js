import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { ensureConnection } from '../config/database.js';

const products = [
  // HATS
  {
    name: 'Classic Baseball Cap',
    description: 'Comfortable cotton baseball cap with adjustable strap',
    price: 299,
    sku: 'HAT-001',
    category: 'hats',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400&q=80',
    stock: { quantity: 50, trackQuantity: true },
    isActive: true,
    isFeatured: true,
  },
  {
    name: 'Beanie Winter Hat',
    description: 'Warm knitted beanie perfect for cold weather',
    price: 249,
    sku: 'HAT-002',
    category: 'hats',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80',
    stock: { quantity: 40, trackQuantity: true },
    isActive: true,
  },
  {
    name: 'Bucket Hat',
    description: 'Trendy bucket hat for casual style',
    price: 349,
    sku: 'HAT-003',
    category: 'hats',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=400&q=80',
    stock: { quantity: 35, trackQuantity: true },
    isActive: true,
  },

  // SHIRTS
  {
    name: 'Classic White T-Shirt',
    description: 'Premium cotton white t-shirt, essential wardrobe staple',
    price: 399,
    sku: 'SHIRT-001',
    category: 'shirts',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
    stock: { quantity: 100, trackQuantity: true },
    isActive: true,
    isFeatured: true,
    variants: { size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  },
  {
    name: 'Graphic Print Tee',
    description: 'Stylish graphic print t-shirt with modern design',
    price: 449,
    sku: 'SHIRT-002',
    category: 'shirts',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80',
    stock: { quantity: 75, trackQuantity: true },
    isActive: true,
    variants: { size: ['S', 'M', 'L', 'XL'] },
  },
  {
    name: 'Long Sleeve Shirt',
    description: 'Comfortable long sleeve shirt for all seasons',
    price: 549,
    sku: 'SHIRT-003',
    category: 'shirts',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80',
    stock: { quantity: 60, trackQuantity: true },
    isActive: true,
    variants: { size: ['S', 'M', 'L', 'XL', 'XXL'] },
  },

  // HOODIES
  {
    name: 'Premium Pullover Hoodie',
    description: 'Cozy fleece-lined hoodie with kangaroo pocket',
    price: 899,
    sku: 'HOOD-001',
    category: 'hoodies',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
    stock: { quantity: 45, trackQuantity: true },
    isActive: true,
    isFeatured: true,
    variants: { size: ['S', 'M', 'L', 'XL', 'XXL'] },
  },
  {
    name: 'Zip-Up Hoodie',
    description: 'Versatile zip-up hoodie for layering',
    price: 949,
    sku: 'HOOD-002',
    category: 'hoodies',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
    stock: { quantity: 50, trackQuantity: true },
    isActive: true,
    variants: { size: ['S', 'M', 'L', 'XL'] },
  },
  {
    name: 'Oversized Hoodie',
    description: 'Trendy oversized fit hoodie for ultimate comfort',
    price: 999,
    sku: 'HOOD-003',
    category: 'hoodies',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80',
    stock: { quantity: 40, trackQuantity: true },
    isActive: true,
    variants: { size: ['M', 'L', 'XL', 'XXL'] },
  },

  // PANTS
  {
    name: 'Classic Denim Jeans',
    description: 'Timeless denim jeans with perfect fit',
    price: 799,
    sku: 'PANT-001',
    category: 'pants',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80',
    stock: { quantity: 70, trackQuantity: true },
    isActive: true,
    isFeatured: true,
    variants: { size: ['28', '30', '32', '34', '36', '38'] },
  },
  {
    name: 'Cargo Pants',
    description: 'Functional cargo pants with multiple pockets',
    price: 849,
    sku: 'PANT-002',
    category: 'pants',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    stock: { quantity: 55, trackQuantity: true },
    isActive: true,
    variants: { size: ['28', '30', '32', '34', '36'] },
  },
  {
    name: 'Jogger Pants',
    description: 'Comfortable jogger pants for casual wear',
    price: 699,
    sku: 'PANT-003',
    category: 'pants',
    brand: 'BabyFiction',
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800&q=80'],
    thumbnail: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80',
    stock: { quantity: 65, trackQuantity: true },
    isActive: true,
    variants: { size: ['S', 'M', 'L', 'XL', 'XXL'] },
  },
];

async function seedProducts() {
  try {
    await ensureConnection();
    console.log('🌱 Seeding products...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('✓ Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`✓ Inserted ${inserted.length} products`);

    console.log('\n📦 Products by category:');
    const categories = ['hats', 'shirts', 'hoodies', 'pants'];
    for (const cat of categories) {
      const count = await Product.countDocuments({ category: cat });
      console.log(`  ${cat}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seedProducts();
