const express = require('express');
const router = express.Router();
const {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart
} = require('../controllers/cartController');
const authenticate = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  addToCartSchema,
  updateCartQuantitySchema
} = require('../validators/orderValidator');

// All cart routes require authenticated user
router.use(authenticate, authorizeRoles('user', 'admin'));

router.get('/', getCart);
router.post('/add', validate(addToCartSchema), addToCart);
router.put('/update', validate(updateCartQuantitySchema), updateCartItem);
router.delete('/remove/:foodId', removeCartItem);
router.delete('/clear', clearCart);

module.exports = router;
