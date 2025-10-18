import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'watches']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true
  },
  images: [{
    type: String,
    required: true
  }],
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail image is required']
  },
  stock: {
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Stock quantity cannot be negative']
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    trackQuantity: {
      type: Boolean,
      default: true
    }
  },
  variants: {
    size: [String],
    color: [String],
    material: [String]
  },
  specifications: {
    weight: String,
    dimensions: String,
    material: String,
    care: String
  },
  features: [String],
  tags: [String],
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add text index for search
productSchema.index({ 
  name: 'text', 
  description: 'text',
  brand: 'text',
  tags: 'text'
});

const Product = mongoose.model('Product', productSchema);

export default Product;