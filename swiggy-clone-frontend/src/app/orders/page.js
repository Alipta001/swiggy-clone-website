'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Store,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  RotateCcw,
  ChevronLeft
} from 'lucide-react';

function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (statusFilter) params.status = statusFilter;

      const res = await orderAPI.getMyOrders(params);
      if (res?.data) {
        setOrders(res.data);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancelOrder = async () => {
    if (!selectedOrderId) return;
    setCancelling(true);
    try {
      await orderAPI.cancelOrder(selectedOrderId);
      toast.success('Order cancelled successfully');
      setCancelModalOpen(false);
      setSelectedOrderId(null);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
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
        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
          styles[status] || 'bg-gray-100 text-gray-800 border-gray-200'
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Track your ongoing deliveries and view past order history
          </p>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition w-full sm:w-48"
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
        <Loading text="Loading your orders..." />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          description={
            statusFilter
              ? `You have no orders with status "${statusFilter}".`
              : "You haven't placed any orders yet. Discover delicious food today!"
          }
          actionLabel="Explore Restaurants"
          actionHref="/restaurants"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:border-orange-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-400">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex items-center gap-1.5 text-base font-bold text-gray-900">
                      <Store className="w-4 h-4 text-orange-500 shrink-0" />
                      <span>{order.restaurant?.name || 'Restaurant'}</span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {dateStr}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                    <span className="text-xs text-gray-400 font-medium">Total Paid</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="py-4">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {order.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-1 truncate">
                    Delivery to: {order.deliveryAddress}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    {order.status === 'Pending' && (
                      <button
                        onClick={() => {
                          setSelectedOrderId(order._id);
                          setCancelModalOpen(true);
                        }}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancel Order
                      </button>
                    )}
                  </div>

                  <Link
                    href={`/orders/${order._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-semibold rounded-lg transition"
                  >
                    View Details
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
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
        </div>
      )}

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This can only be done while the order is Pending."
        confirmLabel="Yes, Cancel Order"
        isDangerous
        loading={cancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => {
          setCancelModalOpen(false);
          setSelectedOrderId(null);
        }}
      />
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <ProtectedRoute>
      <OrdersView />
    </ProtectedRoute>
  );
}
