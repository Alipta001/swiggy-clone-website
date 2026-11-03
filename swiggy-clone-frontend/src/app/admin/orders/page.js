'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Store,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Phone,
  MapPin
} from 'lucide-react';

function AdminOrdersContent() {
  const { adminSecret } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (status) params.status = status;

      const res = await adminAPI.getOrders(params);
      if (res?.data) {
        setOrders(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, adminSecret]);

  const getStatusBadge = (orderStatus) => {
    const styles = {
      Pending: 'bg-amber-100 text-amber-800 border-amber-200',
      Accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      Preparing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Out for Delivery': 'bg-purple-100 text-purple-800 border-purple-200',
      Delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Cancelled: 'bg-red-100 text-red-800 border-red-200',
      Rejected: 'bg-rose-100 text-rose-800 border-rose-200'
    };
    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
          styles[orderStatus] || 'bg-gray-100 text-gray-800 border-gray-200'
        }`}
      >
        {orderStatus}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Platform Orders</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Total recorded platform transactions: {totalItems}
              </p>
            </div>

            {/* Status Filter */}
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition w-full sm:w-48"
            >
              <option value="">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {loading ? (
            <Loading text="Loading platform orders..." />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description="No platform orders match your filter criteria."
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Restaurant</th>
                      <th className="py-3 px-4">Items Summary</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {orders.map((order) => {
                      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });

                      return (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4 font-mono font-bold text-gray-700">
                            #{order._id.slice(-6).toUpperCase()}
                            <p className="font-sans font-normal text-[10px] text-gray-400">
                              {dateStr}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-900">
                              {order.user?.name || 'Customer'}
                            </p>
                            <p className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {order.user?.phone || 'N/A'}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-gray-800">
                              {order.restaurant?.name || 'Restaurant'}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[140px]">
                              {order.restaurant?.address}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="truncate max-w-[180px] text-gray-600">
                              {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                            </p>
                          </td>
                          <td className="py-3 px-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-3 px-4 font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Link
                              href={`/orders/${order._id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline"
                            >
                              Inspect <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
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

export default function AdminOrdersPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminOrdersContent />
    </RoleGuard>
  );
}
