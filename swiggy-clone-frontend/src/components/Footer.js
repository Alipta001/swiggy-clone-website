'use client';

import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Swiggy<span className="text-orange-500">Clone</span>
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Order fresh food online from your favorite nearby restaurants with instant ordering and live order tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/restaurants" className="hover:text-orange-400 transition">
                  All Restaurants
                </Link>
              </li>
              <li>
                <Link href="/foods" className="hover:text-orange-400 transition">
                  Browse Menu
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-orange-400 transition">
                  Food Categories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Account & Support
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/orders" className="hover:text-orange-400 transition">
                  My Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-400 transition">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-orange-400 transition">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* System & Roles */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Partners & Admins
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/dashboard" className="hover:text-orange-400 transition">
                  Restaurant Partner Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-400 transition">
                  Platform Administration
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© 2026 Swiggy Clone. Role-Based Food Ordering Management System.</p>
          <p className="flex items-center gap-1">
            Built with Next.js & Node.js
          </p>
        </div>
      </div>
    </footer>
  );
}
