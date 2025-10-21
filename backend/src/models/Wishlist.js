import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  addedAt: { type: Date, default: Date.now },
});

const wishlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [wishlistItemSchema],
}, { timestamps: true });

wishlistSchema.virtual('totalItems').get(function () {
  return Array.isArray(this.items) ? this.items.length : 0;
});

wishlistSchema.index({ user: 1 });
wishlistSchema.index({ user: 1, 'items.product': 1 });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);
export default Wishlist;
