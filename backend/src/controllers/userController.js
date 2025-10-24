import User from '../models/User.js';
import { createError } from '../utils/errorUtils.js';

export const listUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
    const search = (req.query.search || '').toString().trim();
    const sort = (req.query.sort || 'createdAt').toString();
    const order = (req.query.order || 'desc').toString().toLowerCase() === 'asc' ? 1 : -1;

    const filter = {};
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { email: regex },
        { firstName: regex },
        { lastName: regex },
      ];
    }

    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort({ [sort]: order })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      success: true,
      data: {
        users,
        total,
        page,
        pages: Math.max(Math.ceil(total / limit), 1),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/users/:id/deactivate
// @access  Private/Admin
export const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { duration } = req.body; // duration in days, or 'permanent'

    const user = await User.findById(id);
    if (!user) {
      return next(createError('User not found', 404));
    }

    // Prevent deactivating admin accounts
    if (user.role === 'admin') {
      return next(createError('Cannot deactivate admin accounts', 403));
    }

    user.isActive = false;
    
    if (duration === 'permanent') {
      user.deactivatedUntil = null;
    } else if (duration && !isNaN(duration)) {
      const days = parseInt(duration);
      user.deactivatedUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    await user.save();

    res.json({
      success: true,
      message: duration === 'permanent' 
        ? 'User account deactivated permanently' 
        : `User account deactivated for ${duration} days`,
      user: {
        _id: user._id,
        email: user.email,
        isActive: user.isActive,
        deactivatedUntil: user.deactivatedUntil
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate user account
// @route   PUT /api/users/:id/reactivate
// @access  Private/Admin
export const reactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(createError('User not found', 404));
    }

    user.isActive = true;
    user.deactivatedUntil = null;
    await user.save();

    res.json({
      success: true,
      message: 'User account reactivated successfully',
      user: {
        _id: user._id,
        email: user.email,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return next(createError('User not found', 404));
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
      return next(createError('Cannot delete admin accounts', 403));
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'User account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
