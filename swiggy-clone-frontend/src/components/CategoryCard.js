'use client';

import React from 'react';
import Link from 'next/link';
import { Utensils } from 'lucide-react';

export default function CategoryCard({ category, isSelected = false }) {
  if (!category) return null;

  return (
    <Link
      href={`/foods?category=${category._id}`}
      className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 text-center ${
        isSelected
          ? 'border-orange-500 bg-orange-50/50 shadow-xs'
          : 'border-gray-100 bg-white hover:border-orange-200 hover:shadow-xs'
      }`}
    >
      <div className="w-14 h-14 rounded-full bg-orange-100/60 flex items-center justify-center mb-2 overflow-hidden group-hover:scale-105 transition-transform">
        {category.image ? (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <Utensils
          className={`w-6 h-6 text-orange-500 ${category.image ? 'hidden' : ''}`}
        />
      </div>
      <span className="text-sm font-medium text-gray-800 group-hover:text-orange-600 truncate max-w-full">
        {category.name}
      </span>
      {category.description && (
        <span className="text-xs text-gray-400 truncate max-w-full mt-0.5">
          {category.description}
        </span>
      )}
    </Link>
  );
}
