const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createOrderSchema = Joi.object({
  deliveryAddress: Joi.string().trim().min(5).max(300).required().messages({
    'string.empty': 'Delivery address is required',
    'any.required': 'Delivery address is required'
  }),
  paymentMethod: Joi.string().trim().valid('COD').default('COD')
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('Accepted', 'Rejected', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Order status is required'
    })
});

const addToCartSchema = Joi.object({
  foodId: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid food ID format',
    'any.required': 'Food ID is required'
  }),
  quantity: Joi.number().integer().min(1).default(1).messages({
    'number.min': 'Quantity must be at least 1'
  })
});

const updateCartQuantitySchema = Joi.object({
  foodId: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid food ID format',
    'any.required': 'Food ID is required'
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    'number.min': 'Quantity cannot be negative',
    'any.required': 'Quantity is required'
  })
});

module.exports = {
  createOrderSchema,
  updateOrderStatusSchema,
  addToCartSchema,
  updateCartQuantitySchema
};
