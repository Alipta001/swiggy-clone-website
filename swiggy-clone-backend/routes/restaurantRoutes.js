const express = require('express');
const router = express.Router();
const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  updateRestaurantStatus
} = require('../controllers/restaurantController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateStatusSchema
} = require('../validators/restaurantValidator');

router.get('/', getRestaurants);
router.get('/:id', getRestaurantById);

router.post(
  '/',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(createRestaurantSchema),
  createRestaurant
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(updateRestaurantSchema),
  updateRestaurant
);

router.patch(
  '/:id/status',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(updateStatusSchema),
  updateRestaurantStatus
);

module.exports = router;
