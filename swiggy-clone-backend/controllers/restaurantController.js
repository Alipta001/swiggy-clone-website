const Restaurant = require('../models/Restaurant');
const ApiError = require('../utils/ApiError');

class RestaurantController {
  async createRestaurant(req, res, next) {
    try {
      const { name, description, address, image, cuisine, isOpen } = req.body;

      if (req.user.role === 'owner') {
        const existingRestaurant = await Restaurant.findOne({ owner: req.user._id });
        if (existingRestaurant) {
          return next(
            new ApiError(409, 'You already have a registered restaurant. Only one restaurant per owner is permitted.')
          );
        }
      }

      const cuisineArray = Array.isArray(cuisine)
        ? cuisine
        : cuisine
        ? [cuisine]
        : [];

      const restaurant = await Restaurant.create({
        name,
        description,
        address,
        image: image || '',
        cuisine: cuisineArray,
        isOpen: isOpen !== undefined ? isOpen : true,
        owner: req.user._id
      });

      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: restaurant
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurants(req, res, next) {
    try {
      const { search, cuisine, isOpen, owner, page = 1, limit = 10 } = req.query;

      const query = { isActive: true };

      if (owner) {
        query.owner = owner;
        delete query.isActive;
      }

      if (search) {
        query.name = { $regex: search.trim(), $options: 'i' };
      }

      if (cuisine) {
        query.cuisine = { $regex: cuisine.trim(), $options: 'i' };
      }

      if (isOpen !== undefined) {
        query.isOpen = isOpen === 'true' || isOpen === true;
      }

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const totalItems = await Restaurant.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limitNum) || 1;

      const restaurants = await Restaurant.find(query)
        .populate('owner', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      res.status(200).json({
        success: true,
        message: 'Restaurants retrieved successfully',
        data: restaurants,
        currentPage: pageNum,
        totalPages,
        totalItems
      });
    } catch (error) {
      next(error);
    }
  }

  async getRestaurantById(req, res, next) {
    try {
      const restaurant = await Restaurant.findById(req.params.id).populate(
        'owner',
        'name email phone'
      );

      if (!restaurant || (!restaurant.isActive && req.user?.role !== 'admin')) {
        return next(new ApiError(404, 'Restaurant not found'));
      }

      res.status(200).json({
        success: true,
        message: 'Restaurant retrieved successfully',
        data: restaurant
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurant(req, res, next) {
    try {
      const restaurant = await Restaurant.findById(req.params.id);

      if (!restaurant) {
        return next(new ApiError(404, 'Restaurant not found'));
      }

      if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return next(
          new ApiError(403, 'You are not authorized to update this restaurant')
        );
      }

      const { name, description, address, image, cuisine, isOpen } = req.body;

      if (name !== undefined) restaurant.name = name;
      if (description !== undefined) restaurant.description = description;
      if (address !== undefined) restaurant.address = address;
      if (image !== undefined) restaurant.image = image;
      if (cuisine !== undefined) {
        restaurant.cuisine = Array.isArray(cuisine) ? cuisine : [cuisine];
      }
      if (isOpen !== undefined) restaurant.isOpen = isOpen;

      const updatedRestaurant = await restaurant.save();

      res.status(200).json({
        success: true,
        message: 'Restaurant updated successfully',
        data: updatedRestaurant
      });
    } catch (error) {
      next(error);
    }
  }

  async updateRestaurantStatus(req, res, next) {
    try {
      const restaurant = await Restaurant.findById(req.params.id);

      if (!restaurant) {
        return next(new ApiError(404, 'Restaurant not found'));
      }

      if (
        req.user.role !== 'admin' &&
        restaurant.owner.toString() !== req.user._id.toString()
      ) {
        return next(
          new ApiError(403, 'You are not authorized to manage this restaurant status')
        );
      }

      const { isOpen, isActive } = req.body;

      if (isOpen !== undefined) {
        restaurant.isOpen = Boolean(isOpen);
      }

      if (isActive !== undefined) {
        if (req.user.role !== 'admin') {
          return next(
            new ApiError(403, 'Only admins can change restaurant platform activation status')
          );
        }
        restaurant.isActive = Boolean(isActive);
      }

      const updatedRestaurant = await restaurant.save();

      res.status(200).json({
        success: true,
        message: 'Restaurant status updated successfully',
        data: updatedRestaurant
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RestaurantController();
