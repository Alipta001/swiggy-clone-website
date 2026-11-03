const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Food = require('../models/Food');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');

class AdminController {
  async getAllUsers(req, res, next) {
    try {
      const { search, role, isBlocked, page = 1, limit = 10 } = req.query;

      const query = {};

      if (search) {
        const searchRegex = { $regex: search.trim(), $options: 'i' };
        query.$or = [{ name: searchRegex }, { email: searchRegex }];
      }

      if (role) {
        query.role = role;
      }

      if (isBlocked !== undefined) {
        query.isBlocked = isBlocked === 'true' || isBlocked === true;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await User.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      const users = await User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        message: 'Users retrieved successfully',
        data: users,
        currentPage: pageNum,
        totalPages,
        totalItems
      });
    } catch (error) {
      next(error);
    }
  }

  async blockUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new ApiError(404, 'User not found'));
      }

      if (user._id.toString() === req.user._id.toString()) {
        return next(new ApiError(400, 'Admin cannot block their own account'));
      }

      user.isBlocked = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${user.email} has been blocked successfully`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async unblockUser(req, res, next) {
    try {
      const user = await User.findById(req.params.id);

      if (!user) {
        return next(new ApiError(404, 'User not found'));
      }

      user.isBlocked = false;
      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${user.email} has been unblocked successfully`,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllRestaurants(req, res, next) {
    try {
      const { search, isActive, isOpen, page = 1, limit = 10 } = req.query;

      const query = {};

      if (search) {
        query.name = { $regex: search.trim(), $options: 'i' };
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true' || isActive === true;
      }

      if (isOpen !== undefined) {
        query.isOpen = isOpen === 'true' || isOpen === true;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await Restaurant.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      const restaurants = await Restaurant.find(query)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        message: 'All restaurants retrieved successfully',
        data: restaurants,
        currentPage: pageNum,
        totalPages,
        totalItems
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllOrders(req, res, next) {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      const query = {};
      if (status) {
        query.status = status;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .populate('restaurant', 'name address phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        message: 'All platform orders retrieved successfully',
        data: orders,
        currentPage: pageNum,
        totalPages,
        totalItems
      });
    } catch (error) {
      next(error);
    }
  }

  async getPlatformStatistics(req, res, next) {
    try {
      const [
        totalUsers,
        totalOwners,
        totalRestaurants,
        totalFoods,
        totalOrders,
        deliveredStats
      ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        User.countDocuments({ role: 'owner' }),
        Restaurant.countDocuments(),
        Food.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { status: 'Delivered' } },
          {
            $group: {
              _id: null,
              totalDelivered: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ])
      ]);

      const deliveredInfo = deliveredStats[0] || {
        totalDelivered: 0,
        totalRevenue: 0
      };

      res.status(200).json({
        success: true,
        message: 'Platform statistics retrieved successfully',
        data: {
          totalRegisteredUsers: totalUsers,
          totalRestaurantOwners: totalOwners,
          totalRestaurants,
          totalFoodItems: totalFoods,
          totalOrders,
          totalDeliveredOrders: deliveredInfo.totalDelivered,
          totalRevenue: Math.round(deliveredInfo.totalRevenue * 100) / 100
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
