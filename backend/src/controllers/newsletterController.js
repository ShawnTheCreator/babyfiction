import { body } from 'express-validator';
import Newsletter from '../models/Newsletter.js';
import { createError } from '../utils/errorUtils.js';
import { sendEmail } from '../utils/email.js';

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
export const subscribe = async (req, res, next) => {
  try {
    const { email, firstName, lastName, source } = req.body;
    
    // Check if already subscribed
    let subscriber = await Newsletter.findOne({ email: email.toLowerCase() });
    
    if (subscriber) {
      if (subscriber.status === 'active') {
        return res.json({
          success: true,
          message: 'You are already subscribed to our newsletter'
        });
      } else {
        // Resubscribe if previously unsubscribed
        await subscriber.resubscribe();
        
        // Send welcome email
        try {
          await sendWelcomeEmail(subscriber);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }
        
        return res.json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter'
        });
      }
    }
    
    // Create new subscriber
    subscriber = await Newsletter.create({
      email: email.toLowerCase(),
      firstName: firstName || '',
      lastName: lastName || '',
      source: source || 'footer',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        referrer: req.headers.referer || req.headers.referrer
      }
    });
    
    // Send welcome email
    try {
      await sendWelcomeEmail(subscriber);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter! Check your email for confirmation.'
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(createError('Email already subscribed', 400));
    }
    next(error);
  }
};

// @desc    Unsubscribe from newsletter
// @route   GET /api/newsletter/unsubscribe/:token
// @access  Public
export const unsubscribe = async (req, res, next) => {
  try {
    const { token } = req.params;
    
    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return next(createError('Invalid unsubscribe link', 404));
    }
    
    if (subscriber.status === 'unsubscribed') {
      return res.json({
        success: true,
        message: 'You are already unsubscribed'
      });
    }
    
    await subscriber.unsubscribe();
    
    res.json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscriber preferences
// @route   PUT /api/newsletter/preferences/:token
// @access  Public
export const updatePreferences = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { promotions, newProducts, weeklyDigest } = req.body;
    
    const subscriber = await Newsletter.findOne({ unsubscribeToken: token });
    
    if (!subscriber) {
      return next(createError('Invalid link', 404));
    }
    
    subscriber.preferences = {
      promotions: promotions !== undefined ? promotions : subscriber.preferences.promotions,
      newProducts: newProducts !== undefined ? newProducts : subscriber.preferences.newProducts,
      weeklyDigest: weeklyDigest !== undefined ? weeklyDigest : subscriber.preferences.weeklyDigest
    };
    
    await subscriber.save();
    
    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: subscriber.preferences
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subscribers (Admin)
// @route   GET /api/newsletter/subscribers
// @access  Private/Admin
export const getSubscribers = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const subscribers = await Newsletter.find(query)
      .sort({ subscribedAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await Newsletter.countDocuments(query);
    
    res.json({
      success: true,
      count: subscribers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      subscribers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get newsletter statistics (Admin)
// @route   GET /api/newsletter/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const stats = await Newsletter.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export subscribers (Admin)
// @route   GET /api/newsletter/export
// @access  Private/Admin
export const exportSubscribers = async (req, res, next) => {
  try {
    const { status = 'active' } = req.query;
    
    const subscribers = await Newsletter.find({ status })
      .select('email firstName lastName subscribedAt')
      .sort({ subscribedAt: -1 });
    
    // Convert to CSV
    const csv = [
      'Email,First Name,Last Name,Subscribed At',
      ...subscribers.map(s => 
        `${s.email},${s.firstName || ''},${s.lastName || ''},${s.subscribedAt.toISOString()}`
      )
    ].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscribers-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscriber (Admin)
// @route   DELETE /api/newsletter/subscribers/:id
// @access  Private/Admin
export const deleteSubscriber = async (req, res, next) => {
  try {
    const subscriber = await Newsletter.findByIdAndDelete(req.params.id);
    
    if (!subscriber) {
      return next(createError('Subscriber not found', 404));
    }
    
    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to send welcome email
const sendWelcomeEmail = async (subscriber) => {
  const unsubscribeUrl = `${process.env.FRONTEND_URL}/newsletter/unsubscribe/${subscriber.unsubscribeToken}`;
  const preferencesUrl = `${process.env.FRONTEND_URL}/newsletter/preferences/${subscriber.unsubscribeToken}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .footer a { color: #666; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Babyfiction!</h1>
        </div>
        <div class="content">
          <h2>Thanks for subscribing! 🎉</h2>
          <p>Hi${subscriber.firstName ? ` ${subscriber.firstName}` : ''},</p>
          <p>We're excited to have you join our community! You'll be the first to know about:</p>
          <ul>
            <li>🎁 Exclusive promotions and discounts</li>
            <li>✨ New product launches</li>
            <li>📰 Style tips and trends</li>
            <li>🎉 Special events and sales</li>
          </ul>
          <p>As a welcome gift, use code <strong>WELCOME10</strong> for 10% off your first order!</p>
          <a href="${process.env.FRONTEND_URL}/catalog" class="button">Start Shopping</a>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            Want to customize what emails you receive? 
            <a href="${preferencesUrl}" style="color: #000;">Update your preferences</a>
          </p>
        </div>
        <div class="footer">
          <p>Babyfiction | Premium Fashion & Accessories</p>
          <p>
            <a href="${preferencesUrl}">Email Preferences</a> | 
            <a href="${unsubscribeUrl}">Unsubscribe</a>
          </p>
          <p>© ${new Date().getFullYear()} Babyfiction. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
Welcome to Babyfiction!

Hi${subscriber.firstName ? ` ${subscriber.firstName}` : ''},

Thanks for subscribing to our newsletter! You'll be the first to know about:
- Exclusive promotions and discounts
- New product launches
- Style tips and trends
- Special events and sales

As a welcome gift, use code WELCOME10 for 10% off your first order!

Visit us: ${process.env.FRONTEND_URL}/catalog

---
Update preferences: ${preferencesUrl}
Unsubscribe: ${unsubscribeUrl}

© ${new Date().getFullYear()} Babyfiction. All rights reserved.
  `;
  
  await sendEmail({
    to: subscriber.email,
    subject: 'Welcome to Babyfiction Newsletter! 🎉',
    text: textContent,
    html: htmlContent
  });
};

// Validation rules
export const validateSubscribe = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
];

export default {
  subscribe,
  unsubscribe,
  updatePreferences,
  getSubscribers,
  getStats,
  exportSubscribers,
  deleteSubscriber,
  validateSubscribe
};
