const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const adminSecretMiddleware = require('../middleware/adminSecretMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createCategorySchema,
  updateCategorySchema
} = require('../validators/categoryValidator');

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.post(
  '/',
  authenticate,
  authorizeRoles('admin'),
  adminSecretMiddleware,
  validate(createCategorySchema),
  createCategory
);

router.put(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  adminSecretMiddleware,
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  '/:id',
  authenticate,
  authorizeRoles('admin'),
  adminSecretMiddleware,
  deleteCategory
);

module.exports = router;
