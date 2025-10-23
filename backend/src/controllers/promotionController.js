import { body } from 'express-validator';
import Promotion from '../models/Promotion.js';
import Order from '../models/Order.js';
import { createError } from '../utils/errorUtils.js';

// @desc    Get all promotions
// @route   GET /api/promotions
// @access  Private/Admin
export const getPromotions = async (req, res, next) => {
  try {
    const promotions = await Promotion.find()
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get active promotions
// @route   GET /api/promotions/active
// @access  Public
export const getActivePromotions = async (req, res, next) => {
  try {
    const now = new Date();
    const promotions = await Promotion.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now }
    }).select('code description type value minOrderAmount');
    
    res.json({
      success: true,
      count: promotions.length,
      promotions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single promotion
// @route   GET /api/promotions/:id
// @access  Private/Admin
export const getPromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email');
    
    if (!promotion) {
      return next(createError('Promotion not found', 404));
    }
    
    res.json({
      success: true,
      promotion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate promotion code
// @route   POST /api/promotions/validate
// @access  Private
export const validatePromotion = async (req, res, next) => {
  try {
    const { code, orderAmount, items } = req.body;
    
    const promotion = await Promotion.findOne({ code: code.toUpperCase() });
    
    if (!promotion) {
      return next(createError('Invalid promotion code', 404));
    }
    
    if (!promotion.isValid()) {
      return next(createError('This promotion is no longer valid', 400));
    }
    
    // Check if user can use this promotion
    const canUse = await promotion.canUserUse(req.user._id);
    if (!canUse) {
      return next(createError('You have already used this promotion', 400));
    }
    
    // Check first-time customer restriction
    if (promotion.firstTimeCustomersOnly) {
      const orderCount = await Order.countDocuments({ user: req.user._id });
      if (orderCount > 0) {
        return next(createError('This promotion is for first-time customers only', 400));
      }
    }
    
    // Check minimum order amount
    if (orderAmount < promotion.minOrderAmount) {
      return next(createError(
        `Minimum order amount of R${promotion.minOrderAmount} required`,
        400
      ));
    }
    
    // Calculate discount
    const discount = promotion.calculateDiscount(orderAmount, items);
    const freeShipping = promotion.type === 'free_shipping';
    
    res.json({
      success: true,
      promotion: {
        code: promotion.code,
        description: promotion.description,
        type: promotion.type,
        discount,
        freeShipping
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create promotion
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = async (req, res, next) => {
  try {
    const promotionData = {
      ...req.body,
      createdBy: req.user._id
    };
    
    const promotion = await Promotion.create(promotionData);
    
    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      promotion
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(createError('Promotion code already exists', 400));
    }
    next(error);
  }
};

// @desc    Update promotion
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!promotion) {
      return next(createError('Promotion not found', 404));
    }
    
    res.json({
      success: true,
      message: 'Promotion updated successfully',
      promotion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete promotion
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findByIdAndDelete(req.params.id);
    
    if (!promotion) {
      return next(createError('Promotion not found', 404));
    }
    
    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle promotion active status
// @route   PUT /api/promotions/:id/toggle
// @access  Private/Admin
export const togglePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return next(createError('Promotion not found', 404));
    }
    
    promotion.isActive = !promotion.isActive;
    await promotion.save();
    
    res.json({
      success: true,
      message: `Promotion ${promotion.isActive ? 'activated' : 'deactivated'}`,
      promotion
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get promotion statistics
// @route   GET /api/promotions/:id/stats
// @access  Private/Admin
export const getPromotionStats = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    
    if (!promotion) {
      return next(createError('Promotion not found', 404));
    }
    
    // Get orders that used this promotion
    const orders = await Order.find({ 'promotion.code': promotion.code });
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
    const totalDiscount = orders.reduce((sum, order) => sum + (order.pricing.discount || 0), 0);
    
    res.json({
      success: true,
      stats: {
        usageCount: promotion.usageCount,
        totalOrders: orders.length,
        totalRevenue,
        totalDiscount,
        averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
      }
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validateCreatePromotion = [
  body('code').trim().notEmpty().withMessage('Promotion code is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('type').isIn(['percentage', 'fixed', 'free_shipping']).withMessage('Invalid promotion type'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
];

export default {
  getPromotions,
  getActivePromotions,
  getPromotion,
  validatePromotion,
  createPromotion,
  updatePromotion,
  deletePromotion,
  togglePromotion,
  getPromotionStats,
  validateCreatePromotion
};
