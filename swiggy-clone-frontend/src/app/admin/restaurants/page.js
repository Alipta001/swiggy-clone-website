'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI, restaurantAPI } from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { toast } from 'react-toastify';
import {
  Store,
  Search,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

function AdminRestaurantsContent() {
  const { adminSecret } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState('');
  const [isOpen, setIsOpen] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (isActive !== '') params.isActive = isActive;
      if (isOpen !== '') params.isOpen = isOpen;

      const res = await adminAPI.getRestaurants(params);
      if (res?.data) {
        setRestaurants(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to load restaurants', err);
      toast.error(err.response?.data?.message || 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  }, [page, search, isActive, isOpen]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants, adminSecret]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRestaurants();
  };

  const handleToggleActivation = async (restaurant) => {
    try {
      const newActive = !restaurant.isActive;
      await restaurantAPI.updateStatus(restaurant._id, { isActive: newActive });
      setRestaurants((prev) =>
        prev.map((r) => (r._id === restaurant._id ? { ...r, isActive: newActive } : r))
      );
      toast.success(
        `"${restaurant.name}" platform status updated to ${
          newActive ? 'Active' : 'Inactive'
        }`
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update restaurant status';
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Restaurant Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Total registered vendors: {totalItems}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-48">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
                />
              </form>

              <select
                value={isActive}
                onChange={(e) => {
                  setIsActive(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">All Platform Status</option>
                <option value="true">Active Only</option>
                <option value="false">Inactive Only</option>
              </select>

              <select
                value={isOpen}
                onChange={(e) => {
                  setIsOpen(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">All Operating States</option>
                <option value="true">Open</option>
                <option value="false">Closed</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading text="Loading restaurants..." />
          ) : restaurants.length === 0 ? (
            <EmptyState
              icon={Store}
              title="No restaurants found"
              description="No restaurants match your search or filter criteria."
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Restaurant</th>
                      <th className="py-3 px-4">Owner</th>
                      <th className="py-3 px-4">Cuisine</th>
                      <th className="py-3 px-4">Store Hours</th>
                      <th className="py-3 px-4">Platform Activation</th>
                      <th className="py-3 px-4 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {restaurants.map((r) => {
                      const cuisines = Array.isArray(r.cuisine)
                        ? r.cuisine
                        : r.cuisine
                        ? [r.cuisine]
                        : [];
                      const dateStr = new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      });

                      return (
                        <tr key={r._id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-gray-900">{r.name}</p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {r.address}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-800">
                              {r.owner?.name || 'Unknown Owner'}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {r.owner?.email}
                            </p>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {cuisines.length > 0 ? cuisines.join(', ') : 'Various'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.isOpen
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}
                            >
                              {r.isOpen ? 'Open' : 'Closed'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleToggleActivation(r)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                                r.isActive
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {r.isActive ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ShieldAlert className="w-3.5 h-3.5 text-gray-500" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-400 font-mono">
                            {dateStr}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-100">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-semibold text-gray-700 px-3">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AdminRestaurantsPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminRestaurantsContent />
    </RoleGuard>
  );
}
