const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');

const VALID_TRANSITIONS = {
  Pending: ['Accepted', 'Rejected'],
  Accepted: ['Preparing'],
  Preparing: ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  Delivered: [],
  Rejected: [],
  Cancelled: []
};

class OrderController {
  async createOrder(req, res, next) {
    try {
      const { deliveryAddress, paymentMethod = 'COD' } = req.body;

      const cart = await Cart.findOne({ user: req.user._id }).populate({
        path: 'items.food',
        populate: { path: 'restaurant' }
      });

      if (!cart || !cart.items || cart.items.length === 0) {
        return next(new ApiError(400, 'Your cart is empty. Please add food items before ordering.'));
      }

      let restaurantId = null;
      let computedTotal = 0;
      const orderItems = [];

      for (const item of cart.items) {
        const food = item.food;

        if (!food) {
          return next(new ApiError(400, 'One or more food items in your cart no longer exist'));
        }

        if (!food.isAvailable) {
          return next(new ApiError(400, `Item "${food.name}" is currently unavailable`));
        }

        if (!item.quantity || item.quantity < 1) {
          return next(new ApiError(400, `Invalid quantity for item "${food.name}"`));
        }

        if (!food.restaurant || !food.restaurant.isActive) {
          return next(new ApiError(400, 'The restaurant is currently inactive'));
        }

        if (!restaurantId) {
          restaurantId = food.restaurant._id.toString();
        } else if (restaurantId !== food.restaurant._id.toString()) {
          return next(new ApiError(400, 'All items in an order must be from the same restaurant'));
        }

        const itemPrice = food.price;
        computedTotal += itemPrice * item.quantity;

        orderItems.push({
          food: food._id,
          name: food.name,
          price: itemPrice,
          quantity: item.quantity
        });
      }

      const order = await Order.create({
        user: req.user._id,
        restaurant: restaurantId,
        items: orderItems,
        totalAmount: Math.round(computedTotal * 100) / 100,
        deliveryAddress,
        paymentMethod,
        paymentStatus: 'Pending',
        status: 'Pending'
      });

      cart.items = [];
      await cart.save();

      const populatedOrder = await Order.findById(order._id)
        .populate('restaurant', 'name address phone')
        .populate('user', 'name email phone');

      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: populatedOrder
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyOrders(req, res, next) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const query = { user: req.user._id };
      if (status) {
        query.status = status;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      const orders = await Order.find(query)
        .populate('restaurant', 'name address phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        message: 'User orders retrieved successfully',
        data: orders,
        currentPage: pageNum,
        totalPages,
        totalItems
      });
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req, res, next) {
    try {
      const order = await Order.findById(req.params.id)
        .populate('restaurant', 'name address phone owner')
        .populate('user', 'name email phone');

      if (!order) {
        return next(new ApiError(404, 'Order not found'));
      }

      const isOrderCustomer = order.user._id.toString() === req.user._id.toString();
      const isRestaurantOwner =
        order.restaurant &&
        order.restaurant.owner &&
        order.restaurant.owner.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOrderCustomer && !isRestaurantOwner && !isAdmin) {
        return next(
          new ApiError(403, 'You are not authorized to view this order')
        );
      }

      res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async cancelOrder(req, res, next) {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return next(new ApiError(404, 'Order not found'));
      }

      if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ApiError(403, 'You are not authorized to cancel this order'));
      }

      if (order.status !== 'Pending') {
        return next(
          new ApiError(
            400,
            `Cannot cancel order with status "${order.status}". Only Pending orders can be cancelled.`
          )
        );
      }

      order.status = 'Cancelled';
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantOrders(req, res, next) {
    try {
      const { restaurantId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;

      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return next(new ApiError(404, 'Restaurant not found'));
      }

      if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return next(
          new ApiError(403, 'You are not authorized to view orders for this restaurant')
        );
      }

      const query = { restaurant: restaurantId };
      if (status) {
        query.status = status;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      const orders = await Order.find(query)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        message: 'Restaurant orders retrieved successfully',
        data: orders,
        currentPage: pageNum,
        totalPages,
        totalItems
      });
    } catch (error) {
      next(error);
    }
  }

  async acceptOrder(req, res, next) {
    try {
      const order = await Order.findById(req.params.id).populate('restaurant');

      if (!order) {
        return next(new ApiError(404, 'Order not found'));
      }

      if (
        req.user.role !== 'admin' &&
        order.restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return next(new ApiError(403, 'You are not authorized to manage this order'));
      }

      if (order.status !== 'Pending') {
        return next(
          new ApiError(
            400,
            `Cannot accept an order with status "${order.status}". Only Pending orders can be accepted.`
          )
        );
      }

      order.status = 'Accepted';
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Order accepted successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async rejectOrder(req, res, next) {
    try {
      const order = await Order.findById(req.params.id).populate('restaurant');

      if (!order) {
        return next(new ApiError(404, 'Order not found'));
      }

      if (
        req.user.role !== 'admin' &&
        order.restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return next(new ApiError(403, 'You are not authorized to manage this order'));
      }

      if (order.status !== 'Pending') {
        return next(
          new ApiError(
            400,
            `Cannot reject an order with status "${order.status}". Only Pending orders can be rejected.`
          )
        );
      }

      order.status = 'Rejected';
      await order.save();

      res.status(200).json({
        success: true,
        message: 'Order rejected successfully',
        data: order
      });
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req, res, next) {
    try {
      const { status: newStatus } = req.body;
      const order = await Order.findById(req.params.id).populate('restaurant');

      if (!order) {
        return next(new ApiError(404, 'Order not found'));
      }

      if (
        req.user.role !== 'admin' &&
        order.restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return next(new ApiError(403, 'You are not authorized to update this order status'));
      }

      const allowedNextStatuses = VALID_TRANSITIONS[order.status] || [];

      if (!allowedNextStatuses.includes(newStatus)) {
        return next(
          new ApiError(
            400,
            `Invalid status transition from "${order.status}" to "${newStatus}". Allowed transitions: ${
              allowedNextStatuses.length ? allowedNextStatuses.join(', ') : 'None'
            }`
          )
        );
      }

      order.status = newStatus;

      if (newStatus === 'Delivered') {
        order.paymentStatus = 'Paid';
      }

      await order.save();

      res.status(200).json({
        success: true,
        message: `Order status updated to "${newStatus}"`,
        data: order
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
