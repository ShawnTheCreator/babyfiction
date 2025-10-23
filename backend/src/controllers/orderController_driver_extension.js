// Add these functions to orderController.js

import Order from '../models/Order.js';
import User from '../models/User.js';
import { createError } from '../utils/errorUtils.js';

// @desc    Assign driver to order
// @route   PUT /api/orders/:id/assign-driver
// @access  Private/Admin
export const assignDriver = async (req, res, next) => {
  try {
    const { driverId } = req.body;
    
    // Verify driver exists and has driver role
    const driver = await User.findById(driverId);
    if (!driver || driver.role !== 'driver') {
      return next(createError('Invalid driver ID', 400));
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError('Order not found', 404));
    }
    
    order.assignedDriver = driverId;
    order.assignedAt = new Date();
    await order.save();
    
    res.json({
      success: true,
      message: 'Driver assigned successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unassign driver from order
// @route   PUT /api/orders/:id/unassign-driver
// @access  Private/Admin
export const unassignDriver = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(createError('Order not found', 404));
    }
    
    order.assignedDriver = null;
    order.assignedAt = null;
    await order.save();
    
    res.json({
      success: true,
      message: 'Driver unassigned successfully',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drivers
// @route   GET /api/orders/drivers
// @access  Private/Admin
export const getDrivers = async (req, res, next) => {
  try {
    const drivers = await User.find({ role: 'driver', isActive: true })
      .select('firstName lastName email phone');
    
    // Get delivery counts for each driver
    const driversWithStats = await Promise.all(
      drivers.map(async (driver) => {
        const activeDeliveries = await Order.countDocuments({
          assignedDriver: driver._id,
          status: { $in: ['confirmed', 'processing', 'shipped'] }
        });
        
        const totalDeliveries = await Order.countDocuments({
          assignedDriver: driver._id
        });
        
        return {
          ...driver.toObject(),
          activeDeliveries,
          totalDeliveries
        };
      })
    );
    
    res.json({
      success: true,
      count: driversWithStats.length,
      drivers: driversWithStats
    });
  } catch (error) {
    next(error);
  }
};
