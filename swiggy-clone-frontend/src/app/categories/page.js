'use client';

import React, { useState, useEffect } from 'react';
import { categoryAPI } from '@/lib/api';
import CategoryCard from '@/components/CategoryCard';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { Utensils } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await categoryAPI.getCategories();
        if (res?.data) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Food Categories
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-gray-500">
          Select a category to browse all available dishes in that cuisine
        </p>
      </div>

      {loading ? (
        <Loading text="Loading food categories..." />
      ) : categories.length === 0 ? (
        <EmptyState
          icon={Utensils}
          title="No categories created yet"
          description="Categories will appear here once added by platform administrators."
          actionLabel="Browse Restaurants"
          actionHref="/restaurants"
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      )}
    </div>
  );
}
