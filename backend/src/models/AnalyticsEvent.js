import mongoose from 'mongoose';

const AnalyticsEventSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        'page_view',
        'product_view',
        'add_to_cart',
        'checkout_start',
        'purchase',
        'review_submitted',
      ],
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, sparse: true },
    sessionId: { type: String, index: true },
    route: { type: String },
    productId: { type: String, index: true },
    orderId: { type: String, index: true },
    amount: { type: Number },
    rating: { type: Number },
    referrer: { type: String },
    utm: { type: Object },
    ua: { type: String },
    meta: { type: Object },
    ts: { type: Number },
  },
  { timestamps: true }
);

AnalyticsEventSchema.index({ type: 1, createdAt: -1 });
AnalyticsEventSchema.index({ createdAt: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', AnalyticsEventSchema);
export default AnalyticsEvent;
