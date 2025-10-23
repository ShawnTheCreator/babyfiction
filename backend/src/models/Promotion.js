import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Promotion code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['percentage', 'fixed', 'free_shipping'],
    required: [true, 'Promotion type is required']
  },
  value: {
    type: Number,
    required: function() {
      return this.type !== 'free_shipping';
    },
    min: [0, 'Value cannot be negative'],
    validate: {
      validator: function(value) {
        if (this.type === 'percentage') {
          return value <= 100;
        }
        return true;
      },
      message: 'Percentage discount cannot exceed 100%'
    }
  },
  minOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maxDiscount: {
    type: Number,
    default: null,
    min: [0, 'Maximum discount cannot be negative']
  },
  usageLimit: {
    type: Number,
    default: null,
    min: [1, 'Usage limit must be at least 1']
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  perUserLimit: {
    type: Number,
    default: 1,
    min: [1, 'Per user limit must be at least 1']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: String,
    enum: ['hats', 'shirts', 'hoodies', 'pants', 'clothing', 'shoes', 'accessories', 'bags', 'jewelry', 'watches']
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  firstTimeCustomersOnly: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for quick code lookup
promotionSchema.index({ code: 1 });
promotionSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if promotion is currently valid
promotionSchema.methods.isValid = function() {
  const now = new Date();
  return (
    this.isActive &&
    now >= this.startDate &&
    now <= this.endDate &&
    (this.usageLimit === null || this.usageCount < this.usageLimit)
  );
};

// Method to check if user can use this promotion
promotionSchema.methods.canUserUse = async function(userId) {
  if (!this.isValid()) return false;
  
  // Check per-user limit
  const Order = mongoose.model('Order');
  const userUsageCount = await Order.countDocuments({
    user: userId,
    'promotion.code': this.code
  });
  
  return userUsageCount < this.perUserLimit;
};

// Method to calculate discount amount
promotionSchema.methods.calculateDiscount = function(orderAmount, items = []) {
  if (!this.isValid()) return 0;
  
  // Check minimum order amount
  if (orderAmount < this.minOrderAmount) return 0;
  
  // Check if promotion applies to specific products/categories
  if (this.applicableProducts.length > 0 || this.applicableCategories.length > 0) {
    // Filter applicable items
    const applicableAmount = items.reduce((sum, item) => {
      const isApplicable = 
        (this.applicableProducts.length === 0 || this.applicableProducts.includes(item.product)) &&
        (this.applicableCategories.length === 0 || this.applicableCategories.includes(item.category)) &&
        !this.excludedProducts.includes(item.product);
      
      return isApplicable ? sum + (item.price * item.quantity) : sum;
    }, 0);
    
    if (applicableAmount === 0) return 0;
    orderAmount = applicableAmount;
  }
  
  let discount = 0;
  
  switch (this.type) {
    case 'percentage':
      discount = orderAmount * (this.value / 100);
      break;
    case 'fixed':
      discount = Math.min(this.value, orderAmount);
      break;
    case 'free_shipping':
      // Handled separately in order controller
      return 0;
    default:
      discount = 0;
  }
  
  // Apply maximum discount cap if set
  if (this.maxDiscount !== null && discount > this.maxDiscount) {
    discount = this.maxDiscount;
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

const Promotion = mongoose.model('Promotion', promotionSchema);

export default Promotion;
