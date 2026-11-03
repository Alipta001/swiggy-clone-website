'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { restaurantAPI } from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { Search, Store, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [isOpenFilter, setIsOpenFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 8
      };
      if (search.trim()) params.search = search.trim();
      if (cuisine.trim()) params.cuisine = cuisine.trim();
      if (isOpenFilter !== '') params.isOpen = isOpenFilter;

      const res = await restaurantAPI.getRestaurants(params);
      if (res?.data) {
        setRestaurants(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch restaurants', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, cuisine, isOpenFilter]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCuisine('');
    setIsOpenFilter('');
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Restaurants
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Explore {totalItems} verified restaurants delivering fresh meals to your doorstep
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search restaurant..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
            />
          </form>

          {/* Cuisine Filter */}
          <input
            type="text"
            value={cuisine}
            onChange={(e) => {
              setCuisine(e.target.value);
              setPage(1);
            }}
            placeholder="Cuisine (e.g. Indian, Pizza)"
            className="w-full sm:w-44 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          />

          {/* Status Filter */}
          <select
            value={isOpenFilter}
            onChange={(e) => {
              setIsOpenFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="true">Open Now</option>
            <option value="false">Closed</option>
          </select>

          {(search || cuisine || isOpenFilter !== '') && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-orange-600 font-semibold hover:underline px-2 py-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Restaurant Grid */}
      {loading ? (
        <Loading text="Loading restaurants..." />
      ) : restaurants.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No restaurants match your search"
          description="Try clearing your filters or searching for something else."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard key={restaurant._id} restaurant={restaurant} />
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
