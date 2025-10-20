import { body } from 'express-validator';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { createError } from '../utils/errorUtils.js';
import fetch from 'node-fetch';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = async (req, res, next) => {
  try {
    const { 
      items, 
      shippingAddress, 
      billingAddress, 
      paymentMethod,
      shippingMethod,
      notes 
    } = req.body;
    
    // Calculate totals
    let subtotal = 0;
    let totalItems = 0;
    
    // Verify items and calculate totals
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(createError(`Product not found: ${item.product}`, 404));
      }
      
      // Check stock
      if (product.stock.quantity < item.quantity) {
        return next(createError(`${product.name} is out of stock`, 400));
      }
      
      // Calculate price
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      totalItems += item.quantity;
      
      // Update product stock
      product.stock.quantity -= item.quantity;
      await product.save();
    }
    
    // Calculate tax and shipping
    const taxRate = 0.07; // 7% tax
    const tax = subtotal * taxRate;
    
    // Determine shipping cost based on method
    let shippingCost = 0;
    switch (shippingMethod) {
      case 'standard':
        shippingCost = 5.99;
        break;
      case 'express':
        shippingCost = 12.99;
        break;
      case 'overnight':
        shippingCost = 24.99;
        break;
      default:
        shippingCost = 5.99;
    }
    
    // Calculate total
    const total = subtotal + tax + shippingCost;
    
    // Create order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      billingAddress,
      payment: {
        method: paymentMethod,
        status: 'pending'
      },
      pricing: {
        subtotal,
        tax,
        shipping: shippingCost,
        total
      },
      status: 'pending',
      notes,
      totalItems
    });
    
    // Clear user's cart if order was created from cart
    if (req.body.clearCart) {
      await Cart.findOneAndDelete({ user: req.user._id });
    }
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name price images thumbnail');
      
    if (!order) {
      return next(createError('Order not found', 404));
    }
    
    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(createError('Not authorized to access this order', 403));
    }
    
    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError('Order not found', 404));
    }
    
    order.status = status;
    
    // If order is cancelled, restore product stock
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock.quantity += item.quantity;
          await product.save();
        }
      }
    }
    
    // If order is delivered, update delivery date
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return next(createError('Order not found', 404));
    }
    
    // Check if order belongs to user
    if (order.user.toString() !== req.user._id.toString()) {
      return next(createError('Not authorized to cancel this order', 403));
    }
    
    // Check if order can be cancelled
    if (!['pending', 'processing'].includes(order.status)) {
      return next(createError(`Order cannot be cancelled in ${order.status} status`, 400));
    }
    
    order.status = 'cancelled';
    
    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock.quantity += item.quantity;
        await product.save();
      }
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const orders = await Order.find(filter)
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
      
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order statistics
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
export const getOrderStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' }
        }
      }
    ]);
    
    const statusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Format status counts
    const statusStats = {};
    statusCounts.forEach(item => {
      statusStats[item._id] = item.count;
    });
    
    // Get monthly sales for the current year
    const currentYear = new Date().getFullYear();
    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          total: { $sum: '$pricing.total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalOrders,
        totalSales: totalSales.length > 0 ? totalSales[0].total : 0,
        statusStats,
        monthlySales
      }
    });
  } catch (error) {
    next(error);
  }
};

// Validation rules
export const validateCreateOrder = [
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.product').isMongoId().withMessage('Valid product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required'),
  body('billingAddress').notEmpty().withMessage('Billing address is required'),
  body('paymentMethod').isIn(['credit_card', 'paypal', 'stripe', 'payfast', 'yoco']).withMessage('Valid payment method is required'),
  body('shippingMethod').isIn(['standard', 'express', 'overnight']).withMessage('Valid shipping method is required')
];

export const validateUpdateOrderStatus = [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Valid status is required')
];

// --- Internet Express Shipping ---

// @desc    Create Internet Express shipment (admin)
// @route   POST /api/orders/:id/ship
// @access  Private/Admin
export const createInternetExpressShipment = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError('Order not found', 404));

    // Basic guard
    if (!order.shippingAddress) return next(createError('Shipping address missing', 400));

    // Stub external call to Internet Express API
    // In real integration, use process.env.INTERNET_EXPRESS_API_KEY and BASE_URL
    const now = Date.now();
    const fakeTracking = `IE${now}`;
    const waybill = `WB${now}`;
    const trackingUrl = `${process.env.INTERNET_EXPRESS_TRACK_URL || 'https://www.internetexpress.co.za/track/'}${fakeTracking}`;
    const labelUrl = `${process.env.INTERNET_EXPRESS_LABEL_URL || 'https://example.com/label/'}${waybill}.pdf`;

    order.status = 'shipped';
    order.shipping = {
      ...(order.shipping || {}),
      courier: 'Internet Express',
      service: req.body.service || 'standard',
      trackingNumber: fakeTracking,
      waybillNumber: waybill,
      trackingUrl,
      labelUrl,
      status: 'in_transit',
      dispatchedAt: new Date(),
      estimatedDelivery: req.body.estimatedDelivery || undefined,
      events: [
        {
          status: 'booked',
          description: 'Shipment booked with Internet Express',
          location: order.shippingAddress?.city,
          timestamp: new Date(),
        },
      ],
    };

    await order.save();
    res.json({ success: true, message: 'Shipment created', data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get tracking info for an order (owner or admin)
// @route   GET /api/orders/:id/tracking
// @access  Private
export const getOrderTracking = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return next(createError('Order not found', 404));

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(createError('Not authorized to access this order', 403));
    }

    res.json({ success: true, data: order.shipping || {} });
  } catch (error) {
    next(error);
  }
};