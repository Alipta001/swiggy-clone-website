'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { restaurantAPI, foodAPI, categoryAPI } from '@/lib/api';
import RestaurantCard from '@/components/RestaurantCard';
import FoodCard from '@/components/FoodCard';
import CategoryCard from '@/components/CategoryCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { Search, Store, ArrowRight, Utensils, Sparkles } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [popularFoods, setPopularFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [catRes, restRes, foodRes] = await Promise.allSettled([
          categoryAPI.getCategories(),
          restaurantAPI.getRestaurants({ limit: 8 }),
          foodAPI.getFoods({ limit: 8, isAvailable: true })
        ]);

        if (catRes.status === 'fulfilled' && catRes.value?.data) {
          setCategories(catRes.value.data);
        }
        if (restRes.status === 'fulfilled' && restRes.value?.data) {
          setRestaurants(restRes.value.data);
        }
        if (foodRes.status === 'fulfilled' && foodRes.value?.data) {
          setPopularFoods(foodRes.value.data);
        }
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/foods?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-orange-500/10 via-orange-50/30 to-white py-16 px-4 sm:px-6 lg:px-8 border-b border-orange-100/50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            Order Food Online Fast & Fresh
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            Craving something delicious? <br className="hidden sm:inline" />
            Delivered straight to your door.
          </h1>
          <p className="mt-4 text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Discover the best food & drinks from top-rated local restaurants. Fast delivery, fresh taste, guaranteed satisfaction.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
            <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-gray-100 p-2 focus-within:border-orange-500 transition">
              <Search className="w-5 h-5 text-gray-400 ml-3 mr-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for dishes, cuisines, or restaurants..."
                className="w-full text-sm text-gray-800 placeholder-gray-400 bg-transparent focus:outline-none py-2"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-xs transition shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {loading ? (
          <Loading text="Loading delicious options..." />
        ) : (
          <>
            {/* Categories Section */}
            {categories.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Explore by Category
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-500">
                      What are you in the mood for today?
                    </p>
                  </div>
                  <Link
                    href="/categories"
                    className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
                  >
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {categories.slice(0, 6).map((category) => (
                    <CategoryCard key={category._id} category={category} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Restaurants Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Top Rated Restaurants
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Popular eating spots delivering to you right now
                  </p>
                </div>
                <Link
                  href="/restaurants"
                  className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
                >
                  View All <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {restaurants.length === 0 ? (
                <EmptyState
                  icon={Store}
                  title="No restaurants available yet"
                  description="Be the first to list a restaurant on the platform!"
                  actionLabel="Partner With Us"
                  actionHref="/register"
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {restaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant._id} restaurant={restaurant} />
                  ))}
                </div>
              )}
            </section>

            {/* Popular Food Items Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Popular Dishes
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Trending food items ordered by our community
                  </p>
                </div>
                <Link
                  href="/foods"
                  className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
                >
                  Browse Full Menu <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {popularFoods.length === 0 ? (
                <EmptyState
                  icon={Utensils}
                  title="No dishes available yet"
                  description="Menu items will show up here once restaurants add them."
                  actionLabel="Explore Restaurants"
                  actionHref="/restaurants"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {popularFoods.map((food) => (
                    <FoodCard key={food._id} food={food} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
