const Cart = require('../models/Cart');
const Food = require('../models/Food');
const ApiError = require('../utils/ApiError');

const formatCartResponse = async (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) {
    return {
      items: [],
      itemCount: 0,
      subtotal: 0,
      totalAmount: 0,
      restaurant: null
    };
  }

  await cart.populate({
    path: 'items.food',
    populate: {
      path: 'restaurant',
      select: 'name address isOpen isActive'
    }
  });

  let subtotal = 0;
  let restaurant = null;
  const validItems = [];

  for (const item of cart.items) {
    if (item.food) {
      const itemTotal = item.food.price * item.quantity;
      subtotal += itemTotal;
      if (!restaurant && item.food.restaurant) {
        restaurant = item.food.restaurant;
      }
      validItems.push({
        food: {
          _id: item.food._id,
          name: item.food.name,
          price: item.food.price,
          image: item.food.image,
          isVeg: item.food.isVeg,
          isAvailable: item.food.isAvailable
        },
        quantity: item.quantity,
        itemTotal
      });
    }
  }

  return {
    items: validItems,
    itemCount: validItems.reduce((acc, curr) => acc + curr.quantity, 0),
    subtotal: Math.round(subtotal * 100) / 100,
    totalAmount: Math.round(subtotal * 100) / 100,
    restaurant
  };
};

class CartController {
  async addToCart(req, res, next) {
    try {
      const { foodId, quantity = 1 } = req.body;

      const food = await Food.findById(foodId).populate('restaurant');
      if (!food) {
        return next(new ApiError(404, 'Food item not found'));
      }

      if (!food.isAvailable) {
        return next(new ApiError(400, 'This food item is currently unavailable'));
      }

      if (!food.restaurant || !food.restaurant.isActive) {
        return next(new ApiError(400, 'This restaurant is currently inactive'));
      }

      let cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        cart = await Cart.create({
          user: req.user._id,
          items: []
        });
      }

      if (cart.items.length > 0) {
        await cart.populate('items.food');
        const existingRestaurantId = cart.items[0]?.food?.restaurant?.toString();
        const newRestaurantId = food.restaurant._id.toString();

        if (existingRestaurantId && existingRestaurantId !== newRestaurantId) {
          return next(
            new ApiError(
              400,
              'Your cart contains items from another restaurant. Please clear your cart first or order from the same restaurant.'
            )
          );
        }
      }

      const existingItemIndex = cart.items.findIndex(
        (item) => item.food.toString() === foodId
      );

      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += Number(quantity);
      } else {
        cart.items.push({
          food: food._id,
          quantity: Number(quantity)
        });
      }

      await cart.save();
      const formattedCart = await formatCartResponse(cart);

      res.status(200).json({
        success: true,
        message: 'Food item added to cart successfully',
        data: formattedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async getCart(req, res, next) {
    try {
      let cart = await Cart.findOne({ user: req.user._id });

      if (!cart) {
        cart = await Cart.create({
          user: req.user._id,
          items: []
        });
      }

      const formattedCart = await formatCartResponse(cart);

      res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: formattedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCartItem(req, res, next) {
    try {
      const { foodId, quantity } = req.body;

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart || cart.items.length === 0) {
        return next(new ApiError(404, 'Cart is empty or not found'));
      }

      const itemIndex = cart.items.findIndex(
        (item) => item.food.toString() === foodId
      );

      if (itemIndex === -1) {
        return next(new ApiError(404, 'Food item not found in cart'));
      }

      if (Number(quantity) <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        const food = await Food.findById(foodId);
        if (!food || !food.isAvailable) {
          return next(new ApiError(400, 'This food item is currently unavailable'));
        }
        cart.items[itemIndex].quantity = Number(quantity);
      }

      await cart.save();
      const formattedCart = await formatCartResponse(cart);

      res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        data: formattedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async removeCartItem(req, res, next) {
    try {
      const { foodId } = req.params;

      const cart = await Cart.findOne({ user: req.user._id });
      if (!cart) {
        return next(new ApiError(404, 'Cart not found'));
      }

      cart.items = cart.items.filter((item) => item.food.toString() !== foodId);
      await cart.save();

      const formattedCart = await formatCartResponse(cart);

      res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        data: formattedCart
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req, res, next) {
    try {
      let cart = await Cart.findOne({ user: req.user._id });

      if (cart) {
        cart.items = [];
        await cart.save();
      }

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: {
          items: [],
          subtotal: 0,
          totalAmount: 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CartController();
