const Food = require('../models/Food');
const Restaurant = require('../models/Restaurant');
const Category = require('../models/Category');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

class FoodController {
  // @desc    Add food item to restaurant (Owner only - verified ownership)
  // @route   POST /api/foods
  // @access  Private (Owner, Admin)
  createFood = asyncHandler(async (req, res, next) => {
    const {
      name,
      description,
      price,
      image,
      restaurant: restaurantId,
      category: categoryId,
      isVeg,
      isAvailable
    } = req.body;

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return next(new ApiError(404, 'Associated restaurant not found'));
    }

    // Ownership check
    if (
      req.user.role !== 'admin' &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return next(
        new ApiError(403, 'You do not own this restaurant and cannot add food to it')
      );
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new ApiError(404, 'Selected food category not found'));
    }

    const food = await Food.create({
      name,
      description,
      price,
      image: image || '',
      restaurant: restaurantId,
      category: categoryId,
      isVeg,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    const populatedFood = await Food.findById(food._id)
      .populate('restaurant', 'name address')
      .populate('category', 'name');

    res.status(201).json({
      success: true,
      message: 'Food item added successfully',
      data: populatedFood
    });
  });

  // @desc    Get all foods with search, filtering, and pagination
  // @route   GET /api/foods
  // @access  Public
  getFoods = asyncHandler(async (req, res) => {
    const {
      search,
      restaurant,
      category,
      isVeg,
      minPrice,
      maxPrice,
      isAvailable,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search.trim(), $options: 'i' };
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (category) {
      query.category = category;
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true' || isVeg === true;
    }

    if (isAvailable !== undefined) {
      query.isAvailable = isAvailable === 'true' || isAvailable === true;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      query.price = {};
      if (minPrice !== undefined) query.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) query.price.$lte = Number(maxPrice);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const totalItems = await Food.countDocuments(query);
    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    const foods = await Food.find(query)
      .populate('restaurant', 'name address isOpen isActive')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      message: 'Foods retrieved successfully',
      data: foods,
      currentPage: pageNum,
      totalPages,
      totalItems
    });
  });

  // @desc    Get single food item by ID
  // @route   GET /api/foods/:id
  // @access  Public
  getFoodById = asyncHandler(async (req, res, next) => {
    const food = await Food.findById(req.params.id)
      .populate('restaurant', 'name address isOpen isActive')
      .populate('category', 'name');

    if (!food) {
      return next(new ApiError(404, 'Food item not found'));
    }

    res.status(200).json({
      success: true,
      message: 'Food item retrieved successfully',
      data: food
    });
  });

  // @desc    Update food item (Owner of the restaurant only, or Admin)
  // @route   PUT /api/foods/:id
  // @access  Private (Owner, Admin)
  updateFood = asyncHandler(async (req, res, next) => {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return next(new ApiError(404, 'Food item not found'));
    }

    const restaurant = await Restaurant.findById(food.restaurant);
    if (!restaurant) {
      return next(new ApiError(404, 'Associated restaurant not found'));
    }

    if (
      req.user.role !== 'admin' &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return next(
        new ApiError(403, 'You are not authorized to update this food item')
      );
    }

    const { name, description, price, image, category, isVeg, isAvailable } = req.body;

    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return next(new ApiError(404, 'Category not found'));
      }
      food.category = category;
    }

    if (name !== undefined) food.name = name;
    if (description !== undefined) food.description = description;
    if (price !== undefined) food.price = price;
    if (image !== undefined) food.image = image;
    if (isVeg !== undefined) food.isVeg = isVeg;
    if (isAvailable !== undefined) food.isAvailable = isAvailable;

    const updatedFood = await food.save();

    res.status(200).json({
      success: true,
      message: 'Food item updated successfully',
      data: updatedFood
    });
  });

  // @desc    Delete food item (Owner of the restaurant only, or Admin)
  // @route   DELETE /api/foods/:id
  // @access  Private (Owner, Admin)
  deleteFood = asyncHandler(async (req, res, next) => {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return next(new ApiError(404, 'Food item not found'));
    }

    const restaurant = await Restaurant.findById(food.restaurant);
    if (
      restaurant &&
      req.user.role !== 'admin' &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return next(
        new ApiError(403, 'You are not authorized to delete this food item')
      );
    }

    await Food.deleteOne({ _id: food._id });

    res.status(200).json({
      success: true,
      message: 'Food item deleted successfully',
      data: {}
    });
  });

  // @desc    Update food availability (Owner only)
  // @route   PATCH /api/foods/:id/availability
  // @access  Private (Owner, Admin)
  updateFoodAvailability = asyncHandler(async (req, res, next) => {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return next(new ApiError(404, 'Food item not found'));
    }

    const restaurant = await Restaurant.findById(food.restaurant);
    if (
      restaurant &&
      req.user.role !== 'admin' &&
      restaurant.owner.toString() !== req.user._id.toString()
    ) {
      return next(
        new ApiError(403, 'You are not authorized to modify this food availability')
      );
    }

    const { isAvailable } = req.body;
    food.isAvailable = Boolean(isAvailable);
    await food.save();

    res.status(200).json({
      success: true,
      message: `Food availability updated to ${food.isAvailable}`,
      data: food
    });
  });
}

const foodController = new FoodController();
module.exports = foodController;
module.exports.FoodController = FoodController;
