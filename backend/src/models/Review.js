import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  images: [String],
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Update product rating when review is saved
reviewSchema.post('save', async function() {
  const product = await mongoose.model('Product').findById(this.product);
  if (product) {
    const reviews = await mongoose.model('Review').find({ 
      product: this.product, 
      isActive: true 
    });
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await mongoose.model('Product').findByIdAndUpdate(this.product, {
      'rating.average': averageRating,
      'rating.count': reviews.length
    });
  }
});

// Update product rating when review is deleted
reviewSchema.post('remove', async function() {
  const product = await mongoose.model('Product').findById(this.product);
  if (product) {
    const reviews = await mongoose.model('Review').find({ 
      product: this.product, 
      isActive: true 
    });
    
    const count = reviews.length;
    const averageRating = count > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / count 
      : 0;
    
    await mongoose.model('Product').findByIdAndUpdate(this.product, {
      'rating.average': averageRating,
      'rating.count': count
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;