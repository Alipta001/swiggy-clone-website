const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createFoodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Food name is required',
    'any.required': 'Food name is required'
  }),
  description: Joi.string().trim().allow('').max(500),
  price: Joi.number().min(0).required().messages({
    'number.base': 'Price must be a valid number',
    'any.required': 'Price is required'
  }),
  image: Joi.string().trim().allow(''),
  restaurant: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid restaurant ID format',
    'any.required': 'Restaurant ID is required'
  }),
  category: Joi.string().regex(objectIdPattern).required().messages({
    'string.pattern.base': 'Invalid category ID format',
    'any.required': 'Category ID is required'
  }),
  isVeg: Joi.boolean().required().messages({
    'any.required': 'isVeg flag is required'
  }),
  isAvailable: Joi.boolean().default(true)
});

const updateFoodSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().allow('').max(500),
  price: Joi.number().min(0),
  image: Joi.string().trim().allow(''),
  category: Joi.string().regex(objectIdPattern).messages({
    'string.pattern.base': 'Invalid category ID format'
  }),
  isVeg: Joi.boolean(),
  isAvailable: Joi.boolean()
}).min(1);

const updateAvailabilitySchema = Joi.object({
  isAvailable: Joi.boolean().required().messages({
    'any.required': 'isAvailable flag is required'
  })
});

module.exports = {
  createFoodSchema,
  updateFoodSchema,
  updateAvailabilitySchema
};
