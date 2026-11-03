const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  blockUser,
  unblockUser,
  getAllRestaurants,
  getAllOrders,
  getPlatformStatistics
} = require('../controllers/adminController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const adminSecretMiddleware = require('../middleware/adminSecretMiddleware');

// All admin routes strictly enforce:
// 1. Valid JWT Authentication
// 2. Admin Role Authorization
// 3. x-admin-secret Header Matching
router.use(authenticate, authorizeRoles('admin'), adminSecretMiddleware);

router.get('/users', getAllUsers);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);

router.get('/restaurants', getAllRestaurants);
router.get('/orders', getAllOrders);
router.get('/statistics', getPlatformStatistics);

module.exports = router;
