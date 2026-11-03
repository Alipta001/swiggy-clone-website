const Category = require('../models/Category');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

class CategoryController {
  // @desc    Create new category (Admin only)
  // @route   POST /api/categories
  // @access  Private (Admin with secret key)
  createCategory = asyncHandler(async (req, res, next) => {
    const { name, description, image } = req.body;

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });

    if (existingCategory) {
      return next(new ApiError(409, 'Category with this name already exists'));
    }

    const category = await Category.create({
      name,
      description,
      image: image || ''
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });
  });

  // @desc    Get all categories
  // @route   GET /api/categories
  // @access  Public
  getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories
    });
  });

  // @desc    Get single category by ID
  // @route   GET /api/categories/:id
  // @access  Public
  getCategoryById = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });
  });

  // @desc    Update category (Admin only)
  // @route   PUT /api/categories/:id
  // @access  Private (Admin with secret key)
  updateCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    const { name, description, image } = req.body;

    if (name && name.trim().toLowerCase() !== category.name.toLowerCase()) {
      const duplicate = await Category.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: category._id }
      });
      if (duplicate) {
        return next(new ApiError(409, 'Category with this name already exists'));
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
  });

  // @desc    Delete category (Admin only - prevents deleting if foods exist)
  // @route   DELETE /api/categories/:id
  // @access  Private (Admin with secret key)
  deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ApiError(404, 'Category not found'));
    }

    const associatedFoodCount = await Food.countDocuments({
      category: category._id
    });

    if (associatedFoodCount > 0) {
      return next(
        new ApiError(
          400,
          `Cannot delete category. There are ${associatedFoodCount} food item(s) associated with it.`
        )
      );
    }

    await Category.deleteOne({ _id: category._id });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  });
}

const categoryController = new CategoryController();
module.exports = categoryController;
module.exports.CategoryController = CategoryController;
