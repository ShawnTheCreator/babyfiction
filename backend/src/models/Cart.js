import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Quantity cannot exceed 10']
    },
    size: String,
    color: String
  }],
  totalItems: {
    type: Number,
    default: 0
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    index: { expireAfterSeconds: 0 }
  }
}, {
  timestamps: true
});

// Calculate totals before saving
cartSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Calculate total price
    let total = 0;
    for (const item of this.items) {
      const product = await mongoose.model('Product').findById(item.product);
      if (product) {
        total += product.price * item.quantity;
      }
    }
    this.totalPrice = total;
  }
  next();
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;