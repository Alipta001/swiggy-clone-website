const express = require('express');
const router = express.Router();
const {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
  updateFoodAvailability
} = require('../controllers/foodController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createFoodSchema,
  updateFoodSchema,
  updateAvailabilitySchema
} = require('../validators/foodValidator');

router.get('/', getFoods);
router.get('/:id', getFoodById);

router.post(
  '/',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(createFoodSchema),
  createFood
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(updateFoodSchema),
  updateFood
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('owner', 'admin'),
  deleteFood
);

router.patch(
  '/:id/availability',
  authenticate,
  authorizeRoles('owner', 'admin'),
  validate(updateAvailabilitySchema),
  updateFoodAvailability
);

module.exports = router;
