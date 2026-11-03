const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getRestaurantOrders,
  acceptOrder,
  rejectOrder,
  updateOrderStatus
} = require('../controllers/orderController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createOrderSchema,
  updateOrderStatusSchema
} = require('../validators/orderValidator');

// User Order Endpoints
router.post(
  '/',
  authenticate,
  authorizeRoles('user', 'admin'),
  validate(createOrderSchema),
  createOrder
);

router.get(
  '/my-orders',
  authenticate,
  authorizeRoles('user', 'admin'),
  getMyOrders
);

// Restaurant Owner Order Endpoints
router.get(
  '/restaurant/:restaurantId',
  authenticate,
  authorizeRoles('owner', 'admin'),
  getRestaurantOrders
);

router.patch(
  '/:id/accept',
  authenticate,
  authorizeRoles('owner', 'admin'),
  acceptOrder
);

router.patch(
  '/:id/reject',
  authenticate,
  authorizeRoles('owner', 'admin'),
  rejectOrder
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

// User & authorized access
router.patch(
  '/:id/cancel',
  authenticate,
  cancelOrder
);

router.get(
  '/:id',
  authenticate,
  getOrderById
);

module.exports = router;
