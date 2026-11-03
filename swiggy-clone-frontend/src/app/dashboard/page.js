'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { restaurantAPI, foodAPI, orderAPI } from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import OwnerSidebar from '@/components/OwnerSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import {
  Store,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

function DashboardOverview() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [stats, setStats] = useState({
    foodCount: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerOverview = async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        // Find restaurant owned by current user
        const restRes = await restaurantAPI.getRestaurants({ owner: user.id });
        const myRestaurant = restRes?.data?.[0] || null;

        setRestaurant(myRestaurant);

        if (myRestaurant) {
          const [foodsRes, ordersRes] = await Promise.all([
            foodAPI.getFoods({ restaurant: myRestaurant._id, limit: 1 }),
            orderAPI.getRestaurantOrders(myRestaurant._id, { limit: 100 })
          ]);

          const allOrders = ordersRes?.data || [];
          const pendingCount = allOrders.filter((o) => o.status === 'Pending').length;

          setStats({
            foodCount: foodsRes?.totalItems || 0,
            totalOrders: ordersRes?.totalItems || allOrders.length,
            pendingOrders: pendingCount
          });
        }
      } catch (err) {
        console.error('Failed to load owner overview', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerOverview();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <main className="flex-1 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Welcome back! Here is a summary of your restaurant's activity.
            </p>
          </div>

          {loading ? (
            <Loading text="Loading dashboard metrics..." />
          ) : !restaurant ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto">
                <Store className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                You Haven't Registered a Restaurant Yet
              </h2>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                To start accepting orders and publishing delicious dishes, register your restaurant profile now.
              </p>
              <Link
                href="/dashboard/restaurant"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                Register Restaurant
              </Link>
            </div>
          ) : (
            <>
              {/* Restaurant Status Card */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-gray-900">
                      {restaurant.name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        restaurant.isOpen
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {restaurant.isOpen ? 'Open for Orders' : 'Currently Closed'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{restaurant.address}</p>
                </div>

                <Link
                  href="/dashboard/restaurant"
                  className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 rounded-xl transition self-start sm:self-center"
                >
                  Manage Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Real Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Food Items */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Total Menu Items
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                      <UtensilsCrossed className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {stats.foodCount}
                  </p>
                  <Link
                    href="/dashboard/foods"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-orange-600 hover:underline"
                  >
                    Manage menu items <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Total Orders
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-gray-900 mt-2">
                    {stats.totalOrders}
                  </p>
                  <Link
                    href="/dashboard/orders"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    View all orders <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

                {/* Pending Orders */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500">
                      Pending Action
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Clock className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-black text-amber-600 mt-2">
                    {stats.pendingOrders}
                  </p>
                  <Link
                    href="/dashboard/orders?status=Pending"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 hover:underline"
                  >
                    Review pending orders <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <DashboardOverview />
    </RoleGuard>
  );
}
