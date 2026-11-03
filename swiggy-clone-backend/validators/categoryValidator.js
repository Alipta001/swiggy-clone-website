const Joi = require('joi');

const createCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50).required().messages({
    'string.empty': 'Category name is required',
    'any.required': 'Category name is required'
  }),
  description: Joi.string().trim().allow('').max(300),
  image: Joi.string().trim().allow('')
});

const updateCategorySchema = Joi.object({
  name: Joi.string().trim().min(2).max(50),
  description: Joi.string().trim().allow('').max(300),
  image: Joi.string().trim().allow('')
}).min(1);

module.exports = {
  createCategorySchema,
  updateCategorySchema
};
