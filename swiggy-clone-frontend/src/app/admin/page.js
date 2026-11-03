'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Loading from '@/components/Loading';
import {
  Users,
  Store,
  ShoppingBag,
  Layers,
  IndianRupee,
  UtensilsCrossed,
  CheckCircle,
  KeyRound,
  ArrowRight
} from 'lucide-react';

function AdminOverviewContent() {
  const { adminSecret } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await adminAPI.getStatistics();
        if (res?.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats', err);
        setError(
          err.response?.data?.message ||
            'Failed to load platform statistics. Ensure your admin secret key is set.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [adminSecret]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Platform Analytics & Overview
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Aggregated real-time metrics across all users, restaurants, orders, and revenue
            </p>
          </div>

          {!adminSecret && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-amber-900">Admin Secret Key Missing</p>
                  <p className="text-[11px] text-amber-700">
                    Click 'Enter Secret Key' in the sidebar to authorize admin API queries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {loading ? (
            <Loading text="Loading platform statistics..." />
          ) : stats ? (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Revenue */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Total Delivered Revenue
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-emerald-600 mt-2">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    From {stats.totalDeliveredOrders} completed orders
                  </p>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Total Orders
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {stats.totalOrders}
                  </p>
                  <Link
                    href="/admin/orders"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View order management <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Total Users */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Registered Customers
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {stats.totalRegisteredUsers}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Plus {stats.totalRestaurantOwners} restaurant owners
                  </p>
                </div>

                {/* Total Restaurants */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Active Restaurants
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Store className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {stats.totalRestaurants}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    With {stats.totalFoodItems} dishes listed
                  </p>
                </div>
              </div>

              {/* Quick Jump Panels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:border-red-200 hover:shadow-sm transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        User Management
                      </h3>
                      <p className="text-xs text-gray-500">
                        Search, filter, block, or unblock user accounts
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>

                <Link
                  href="/admin/categories"
                  className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:border-red-200 hover:shadow-sm transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">
                        Category Management
                      </h3>
                      <p className="text-xs text-gray-500">
                        Add, edit, and organize global cuisine categories
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </Link>
              </div>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminOverviewContent />
    </RoleGuard>
  );
}
