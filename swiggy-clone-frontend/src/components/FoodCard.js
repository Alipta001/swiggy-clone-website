'use client';

import React, { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { formatPrice } from '@/utils/formatPrice';
import { toast } from 'react-toastify';
import { Plus, Minus, UtensilsCrossed } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function FoodCard({ food, restaurantOpen = true }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const { isAuthenticated, isOwner } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!food) return null;

  // Check if item is currently in cart
  const cartItem = cart?.items?.find(
    (item) => item.food?._id === food._id || item.food === food._id
  );
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.info('Please log in to add items to your cart');
      router.push('/login');
      return;
    }

    if (isOwner) {
      toast.warning('Restaurant owners cannot place orders');
      return;
    }

    if (!food.isAvailable) {
      toast.error('This item is currently unavailable');
      return;
    }

    setLoading(true);
    try {
      await addToCart(food._id, 1);
      toast.success(`${food.name} added to cart!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateQuantity(food._id, currentQuantity + 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrement = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateQuantity(food._id, currentQuantity - 1);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-orange-200 hover:shadow-xs transition">
      {/* Food Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {/* Veg / Non-veg marker */}
          <span
            className={`w-4 h-4 border flex items-center justify-center rounded-xs shrink-0 ${
              food.isVeg
                ? 'border-emerald-600'
                : 'border-red-600'
            }`}
            title={food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                food.isVeg ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            />
          </span>

          {food.category?.name && (
            <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm">
              {food.category.name}
            </span>
          )}
        </div>

        <h4 className="text-base font-semibold text-gray-900 truncate">
          {food.name}
        </h4>

        <p className="text-sm font-bold text-gray-900 mt-1">
          {formatPrice(food.price)}
        </p>

        {food.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {food.description}
          </p>
        )}

        {food.restaurant?.name && (
          <p className="text-[11px] text-gray-400 mt-2 truncate">
            From: {food.restaurant.name}
          </p>
        )}
      </div>

      {/* Food Image & Action */}
      <div className="flex flex-col items-center shrink-0 w-28">
        <div className="w-24 h-24 rounded-lg bg-gray-100 overflow-hidden relative mb-2">
          {food.image ? (
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 ${
              food.image ? 'hidden' : ''
            }`}
          >
            <UtensilsCrossed className="w-8 h-8" />
          </div>

          {!food.isAvailable && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-1 text-center">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Add or Counter Button */}
        {!food.isAvailable || !restaurantOpen ? (
          <span className="text-xs font-medium text-gray-400 py-1.5 px-3 bg-gray-100 rounded-md">
            {!restaurantOpen ? 'Closed' : 'Sold Out'}
          </span>
        ) : currentQuantity > 0 ? (
          <div className="flex items-center justify-between w-24 bg-orange-50 border border-orange-200 rounded-lg py-1 px-2 text-orange-600">
            <button
              onClick={handleDecrement}
              disabled={loading}
              className="p-1 hover:bg-orange-100 rounded-sm transition disabled:opacity-50"
              title="Decrease"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="text-xs font-bold text-gray-900">{currentQuantity}</span>
            <button
              onClick={handleIncrement}
              disabled={loading}
              className="p-1 hover:bg-orange-100 rounded-sm transition disabled:opacity-50"
              title="Increase"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={loading}
            className="w-24 py-1.5 px-3 text-xs font-bold text-orange-600 bg-white border border-orange-500 hover:bg-orange-50 rounded-lg shadow-2xs transition uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
        )}
      </div>
    </div>
  );
}
