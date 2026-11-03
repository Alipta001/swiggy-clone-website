const Joi = require('joi');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Restaurant name is required',
    'any.required': 'Restaurant name is required'
  }),
  description: Joi.string().trim().allow('').max(500),
  address: Joi.string().trim().min(5).max(250).required().messages({
    'string.empty': 'Address is required',
    'any.required': 'Address is required'
  }),
  image: Joi.string().trim().allow(''),
  cuisine: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  isOpen: Joi.boolean().default(true)
});

const updateRestaurantSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100),
  description: Joi.string().trim().allow('').max(500),
  address: Joi.string().trim().min(5).max(250),
  image: Joi.string().trim().allow(''),
  cuisine: Joi.alternatives().try(
    Joi.array().items(Joi.string().trim()),
    Joi.string().trim()
  ),
  isOpen: Joi.boolean()
}).min(1);

const updateStatusSchema = Joi.object({
  isOpen: Joi.boolean(),
  isActive: Joi.boolean()
}).min(1);

module.exports = {
  createRestaurantSchema,
  updateRestaurantSchema,
  updateStatusSchema
};
