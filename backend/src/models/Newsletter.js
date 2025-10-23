import mongoose from 'mongoose';

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  firstName: {
    type: String,
    trim: true,
    default: ''
  },
  lastName: {
    type: String,
    trim: true,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  source: {
    type: String,
    enum: ['footer', 'checkout', 'popup', 'manual', 'import'],
    default: 'footer'
  },
  tags: [{
    type: String,
    trim: true
  }],
  preferences: {
    promotions: { type: Boolean, default: true },
    newProducts: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false }
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: Date,
  lastEmailSent: Date,
  emailsSent: {
    type: Number,
    default: 0
  },
  emailsOpened: {
    type: Number,
    default: 0
  },
  emailsClicked: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ subscribedAt: -1 });
newsletterSchema.index({ unsubscribeToken: 1 });

// Generate unsubscribe token before saving
newsletterSchema.pre('save', function(next) {
  if (this.isNew && !this.unsubscribeToken) {
    this.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Method to check if subscriber is active
newsletterSchema.methods.isActive = function() {
  return this.status === 'active';
};

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.status = 'unsubscribed';
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.status = 'active';
  this.unsubscribedAt = null;
  this.subscribedAt = new Date();
  return this.save();
};

// Method to track email sent
newsletterSchema.methods.trackEmailSent = function() {
  this.emailsSent += 1;
  this.lastEmailSent = new Date();
  return this.save();
};

// Method to track email opened
newsletterSchema.methods.trackEmailOpened = function() {
  this.emailsOpened += 1;
  return this.save();
};

// Method to track email clicked
newsletterSchema.methods.trackEmailClicked = function() {
  this.emailsClicked += 1;
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function(filters = {}) {
  return this.find({ status: 'active', ...filters });
};

// Static method to get subscriber stats
newsletterSchema.statics.getStats = async function() {
  const total = await this.countDocuments();
  const active = await this.countDocuments({ status: 'active' });
  const unsubscribed = await this.countDocuments({ status: 'unsubscribed' });
  const bounced = await this.countDocuments({ status: 'bounced' });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const newToday = await this.countDocuments({ subscribedAt: { $gte: today } });
  
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const newThisWeek = await this.countDocuments({ subscribedAt: { $gte: lastWeek } });
  
  return {
    total,
    active,
    unsubscribed,
    bounced,
    newToday,
    newThisWeek
  };
};

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

export default Newsletter;
