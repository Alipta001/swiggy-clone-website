'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { restaurantAPI, foodAPI } from '@/lib/api';
import FoodCard from '@/components/FoodCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  ArrowLeft,
  UtensilsCrossed,
  Filter
} from 'lucide-react';

function RestaurantContent({ params }) {
  const unwrappedParams = use(params);
  const restaurantId = unwrappedParams.id;

  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [restRes, foodsRes] = await Promise.all([
          restaurantAPI.getRestaurantById(restaurantId),
          foodAPI.getFoods({ restaurant: restaurantId, limit: 100 })
        ]);

        if (restRes?.data) {
          setRestaurant(restRes.data);
        }
        if (foodsRes?.data) {
          setFoods(foodsRes.data);
        }
      } catch (err) {
        console.error('Failed to load restaurant details', err);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchDetails();
    }
  }, [restaurantId]);

  if (loading) {
    return <Loading fullScreen text="Loading restaurant menu..." />;
  }

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={Store}
          title="Restaurant not found"
          description="The restaurant you are looking for does not exist or is currently inactive."
          actionLabel="Browse All Restaurants"
          actionHref="/restaurants"
        />
      </div>
    );
  }

  const cuisines = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : restaurant.cuisine
    ? [restaurant.cuisine]
    : [];

  // Filter foods by category and vegOnly
  const filteredFoods = foods.filter((food) => {
    if (vegOnly && !food.isVeg) return false;
    if (selectedCategory !== 'all') {
      const catId = food.category?._id || food.category;
      if (catId !== selectedCategory) return false;
    }
    return true;
  });

  // Extract unique categories available in this restaurant's menu
  const availableCategories = [];
  const seenCatIds = new Set();
  foods.forEach((f) => {
    if (f.category && !seenCatIds.has(f.category._id || f.category)) {
      seenCatIds.add(f.category._id || f.category);
      availableCategories.push({
        id: f.category._id || f.category,
        name: f.category.name || 'Category'
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/restaurants"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Restaurants
      </Link>

      {/* Restaurant Header Card */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-full sm:w-48 h-36 rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
            {restaurant.image ? (
              <img
                src={restaurant.image}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div
              className={`w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 ${
                restaurant.image ? 'hidden' : ''
              }`}
            >
              <Store className="w-12 h-12" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 truncate">
                {restaurant.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  restaurant.isOpen
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {restaurant.isOpen ? 'Open Now' : 'Currently Closed'}
              </span>
            </div>

            {cuisines.length > 0 && (
              <p className="mt-2 text-sm text-gray-600 font-medium">
                {cuisines.join(' • ')}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-400" />
                {restaurant.address}
              </span>
              {restaurant.owner?.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4 text-gray-400" />
                  {restaurant.owner.phone}
                </span>
              )}
            </div>

            {restaurant.description && (
              <p className="mt-3 text-xs sm:text-sm text-gray-500 leading-relaxed">
                {restaurant.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Menu Filter Bar */}
      <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-5 h-5 text-orange-500" />
            Menu ({filteredFoods.length} items)
          </h2>
          <p className="text-xs text-gray-400">Order your favorite dishes below</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <span
              className={`w-3 h-3 border flex items-center justify-center rounded-2xs ${
                vegOnly ? 'border-emerald-600' : 'border-gray-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  vegOnly ? 'bg-emerald-600' : 'bg-transparent'
                }`}
              />
            </span>
            Veg Only
          </button>

          {/* Category Dropdown */}
          {availableCategories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Food Items List */}
      {filteredFoods.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="No food items found"
          description="There are no items matching your current filter in this restaurant."
          actionLabel="Show All Items"
          onAction={() => {
            setSelectedCategory('all');
            setVegOnly(false);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFoods.map((food) => (
            <FoodCard
              key={food._id}
              food={food}
              restaurantOpen={restaurant.isOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function RestaurantDetailPage(props) {
  return (
    <React.Suspense fallback={<Loading fullScreen text="Loading restaurant..." />}>
      <RestaurantContent {...props} />
    </React.Suspense>
  );
}
