'use client';

import React from 'react';
import Link from 'next/link';
import { Store, MapPin } from 'lucide-react';

export default function RestaurantCard({ restaurant }) {
  if (!restaurant) return null;

  const cuisines = Array.isArray(restaurant.cuisine)
    ? restaurant.cuisine
    : restaurant.cuisine
    ? [restaurant.cuisine]
    : [];

  return (
    <Link
      href={`/restaurants/${restaurant._id}`}
      className="group block bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md hover:border-orange-200 transition-all duration-200"
    >
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        {restaurant.image ? (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={`w-full h-full flex items-center justify-center bg-linear-to-br from-orange-50 to-orange-100 text-orange-400 ${
            restaurant.image ? 'hidden' : ''
          }`}
        >
          <Store className="w-12 h-12" />
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs ${
              restaurant.isOpen
                ? 'bg-emerald-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {restaurant.isOpen ? 'Open Now' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 group-hover:text-orange-600 truncate">
          {restaurant.name}
        </h3>

        {/* Cuisine Tags */}
        {cuisines.length > 0 && (
          <p className="mt-1 text-xs text-gray-500 truncate">
            {cuisines.join(' • ')}
          </p>
        )}

        {/* Address */}
        <div className="mt-2.5 flex items-center text-xs text-gray-400">
          <MapPin className="w-3.5 h-3.5 mr-1 shrink-0 text-gray-400" />
          <span className="truncate">{restaurant.address}</span>
        </div>

        {restaurant.description && (
          <p className="mt-2 text-xs text-gray-500 line-clamp-2">
            {restaurant.description}
          </p>
        )}
      </div>
    </Link>
  );
}
