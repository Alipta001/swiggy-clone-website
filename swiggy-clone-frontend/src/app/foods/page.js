'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { foodAPI, categoryAPI } from '@/lib/api';
import FoodCard from '@/components/FoodCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { Search, Utensils, ChevronLeft, ChevronRight, X } from 'lucide-react';

function FoodsContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [isVeg, setIsVeg] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isAvailable, setIsAvailable] = useState('true');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load categories once
  useEffect(() => {
    categoryAPI
      .getCategories()
      .then((res) => {
        if (res?.data) setCategories(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Update state if searchParams change
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialSearch) setSearch(initialSearch);
  }, [initialCategory, initialSearch]);

  const fetchFoods = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (isVeg !== '') params.isVeg = isVeg;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (isAvailable !== '') params.isAvailable = isAvailable;

      const res = await foodAPI.getFoods(params);
      if (res?.data) {
        setFoods(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch food items', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, isVeg, minPrice, maxPrice, isAvailable]);

  useEffect(() => {
    fetchFoods();
  }, [fetchFoods]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchFoods();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setIsVeg('');
    setMinPrice('');
    setMaxPrice('');
    setIsAvailable('true');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Browse Food Menu
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Explore delicious dishes from top restaurants with custom dietary filters
        </p>

        {/* Filter Toolbar */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dish name..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
            />
          </form>

          {/* Category Dropdown */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Veg / Non-Veg Dropdown */}
          <select
            value={isVeg}
            onChange={(e) => {
              setIsVeg(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          >
            <option value="">Veg & Non-Veg</option>
            <option value="true">Veg Only</option>
            <option value="false">Non-Veg Only</option>
          </select>

          {/* Min Price */}
          <input
            type="number"
            min="0"
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            placeholder="Min ₹"
            className="w-20 px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          />

          {/* Max Price */}
          <input
            type="number"
            min="0"
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            placeholder="Max ₹"
            className="w-20 px-2.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          />

          {/* Availability */}
          <select
            value={isAvailable}
            onChange={(e) => {
              setIsAvailable(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          >
            <option value="">All Items</option>
            <option value="true">Available Now</option>
            <option value="false">Sold Out</option>
          </select>

          {/* Reset button */}
          {(search || category || isVeg !== '' || minPrice || maxPrice || isAvailable !== 'true') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-orange-600 font-semibold hover:underline px-2 py-1 flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Food Cards Grid */}
      {loading ? (
        <Loading text="Loading food menu..." />
      ) : foods.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No food items match your criteria"
          description="Try adjusting your filters or price range."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foods.map((food) => (
              <FoodCard
                key={food._id}
                food={food}
                restaurantOpen={food.restaurant?.isOpen ?? true}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-gray-700 px-3">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FoodsPage() {
  return (
    <Suspense fallback={<Loading fullScreen text="Loading menu..." />}>
      <FoodsContent />
    </Suspense>
  );
}
