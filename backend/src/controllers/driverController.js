import Order from '../models/Order.js';
import User from '../models/User.js';
import { createError } from '../utils/errorUtils.js';
import { sendOrderStatusSMS } from '../services/smsService.js';

// @desc    Get driver's assigned orders
// @route   GET /api/driver/orders
// @access  Private/Driver
export const getDriverOrders = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    
    // Get all orders assigned to this driver
    const orders = await Order.find({ assignedDriver: driverId })
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnail')
      .sort({ assignedAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver's active deliveries (not delivered/cancelled)
// @route   GET /api/driver/active
// @access  Private/Driver
export const getActiveDeliveries = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    
    const orders = await Order.find({
      assignedDriver: driverId,
      status: { $in: ['confirmed', 'processing', 'shipped'] }
    })
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnail')
      .sort({ assignedAt: -1 });
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver's completed deliveries
// @route   GET /api/driver/completed
// @access  Private/Driver
export const getCompletedDeliveries = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    
    const orders = await Order.find({
      assignedDriver: driverId,
      status: { $in: ['delivered', 'cancelled'] }
    })
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name thumbnail')
      .sort({ deliveredAt: -1 })
      .limit(50);
    
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status
// @route   PUT /api/driver/orders/:id/status
// @access  Private/Driver
export const updateDeliveryStatus = async (req, res, next) => {
  try {
    const { status, notes, location } = req.body;
    const driverId = req.user._id;
    
    const order = await Order.findOne({
      _id: req.params.id,
      assignedDriver: driverId
    }).populate('user', 'phone');
    
    if (!order) {
      return next(createError('Order not found or not assigned to you', 404));
    }
    
    // Validate status transition
    const allowedStatuses = ['processing', 'shipped', 'delivered'];
    if (!allowedStatuses.includes(status)) {
      return next(createError('Invalid status', 400));
    }
    
    // Update order status
    order.status = status;
    
    if (notes) {
      order.driverNotes = notes;
    }
    
    // Add shipping event
    if (order.shipping && location) {
      order.shipping.events.push({
        status: status,
        description: notes || `Status updated to ${status}`,
        location: location,
        timestamp: new Date()
      });
    }
    
    // Update delivery date if delivered
    if (status === 'delivered') {
      order.deliveredAt = new Date();
      if (order.shipping) {
        order.shipping.status = 'delivered';
        order.shipping.deliveredAt = new Date();
      }
    }
    
    // Update shipping status
    if (status === 'shipped' && order.shipping) {
      order.shipping.status = 'in_transit';
      order.shipping.dispatchedAt = new Date();
    }
    
    await order.save();
    
    // Send SMS notification to customer
    try {
      const phone = order.user?.phone || order.shippingAddress?.phone;
      if (phone) {
        await sendOrderStatusSMS(phone, order._id, status);
      }
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
    }
    
    res.json({
      success: true,
      message: 'Delivery status updated successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark order as out for delivery
// @route   PUT /api/driver/orders/:id/out-for-delivery
// @access  Private/Driver
export const markOutForDelivery = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    
    const order = await Order.findOne({
      _id: req.params.id,
      assignedDriver: driverId
    }).populate('user', 'phone');
    
    if (!order) {
      return next(createError('Order not found or not assigned to you', 404));
    }
    
    order.status = 'shipped';
    if (order.shipping) {
      order.shipping.status = 'out_for_delivery';
      order.shipping.events.push({
        status: 'out_for_delivery',
        description: 'Out for delivery',
        timestamp: new Date()
      });
    }
    
    await order.save();
    
    // Send SMS
    try {
      const phone = order.user?.phone || order.shippingAddress?.phone;
      if (phone) {
        await sendOrderStatusSMS(phone, order._id, 'out for delivery');
      }
    } catch (smsError) {
      console.error('Failed to send SMS:', smsError);
    }
    
    res.json({
      success: true,
      message: 'Order marked as out for delivery',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get driver statistics
// @route   GET /api/driver/stats
// @access  Private/Driver
export const getDriverStats = async (req, res, next) => {
  try {
    const driverId = req.user._id;
    
    const [totalDeliveries, activeDeliveries, completedToday] = await Promise.all([
      Order.countDocuments({ assignedDriver: driverId }),
      Order.countDocuments({
        assignedDriver: driverId,
        status: { $in: ['confirmed', 'processing', 'shipped'] }
      }),
      Order.countDocuments({
        assignedDriver: driverId,
        status: 'delivered',
        deliveredAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);
    
    res.json({
      success: true,
      stats: {
        totalDeliveries,
        activeDeliveries,
        completedToday
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add delivery note/photo
// @route   POST /api/driver/orders/:id/note
// @access  Private/Driver
export const addDeliveryNote = async (req, res, next) => {
  try {
    const { note } = req.body;
    const driverId = req.user._id;
    
    const order = await Order.findOne({
      _id: req.params.id,
      assignedDriver: driverId
    });
    
    if (!order) {
      return next(createError('Order not found or not assigned to you', 404));
    }
    
    order.driverNotes = note;
    await order.save();
    
    res.json({
      success: true,
      message: 'Note added successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getDriverOrders,
  getActiveDeliveries,
  getCompletedDeliveries,
  updateDeliveryStatus,
  markOutForDelivery,
  getDriverStats,
  addDeliveryNote
};
