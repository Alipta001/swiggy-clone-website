'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { restaurantAPI, orderAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import RoleGuard from '@/components/RoleGuard';
import OwnerSidebar from '@/components/OwnerSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Store,
  Check,
  X,
  ChefHat,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

function OwnerOrdersContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [restaurant, setRestaurant] = useState(null);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // Reject confirmation modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [orderToReject, setOrderToReject] = useState(null);

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const restRes = await restaurantAPI.getRestaurants({ owner: user.id });
      const myRest = restRes?.data?.[0] || null;
      setRestaurant(myRest);

      if (myRest) {
        const params = { page, limit: 10 };
        if (statusFilter) params.status = statusFilter;

        const ordersRes = await orderAPI.getRestaurantOrders(myRest._id, params);
        if (ordersRes?.data) {
          setOrders(ordersRes.data);
          setTotalPages(ordersRes.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load restaurant orders', err);
    } finally {
      setLoading(false);
    }
  }, [user, page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleAccept = async (orderId) => {
    setActionLoading(orderId);
    try {
      await orderAPI.acceptOrder(orderId);
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to accept order';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!orderToReject) return;
    setActionLoading(orderToReject._id);
    try {
      await orderAPI.rejectOrder(orderToReject._id);
      toast.success('Order rejected');
      setRejectModalOpen(false);
      setOrderToReject(null);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject order';
      toast.error(msg);
    } finally {
      setActionLoading(null);
    }
  };

  const handleProgressStatus = async (orderId, newStatus) => {
    setActionLoading(orderId);
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to "${newStatus}"`);
      fetchOrders();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update order status';
      toast.error(msg);
    } finally {
      setActionLoading(null);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Incoming Orders</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Review and progress customer orders through the kitchen preparation workflow
              </p>
            </div>

            {/* Filter by status */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition w-full sm:w-48"
            >
              <option value="">All Orders</option>
              <option value="Pending">Pending (Needs Action)</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {loading ? (
            <Loading text="Loading restaurant orders..." />
          ) : !restaurant ? (
            <EmptyState
              icon={Store}
              title="Restaurant Needed"
              description="Please register your restaurant before managing orders."
              actionLabel="Create Restaurant"
              actionHref="/dashboard/restaurant"
            />
          ) : orders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="No orders found"
              description={
                statusFilter
                  ? `There are no orders with status "${statusFilter}".`
                  : 'Your restaurant has not received any orders yet.'
              }
            />
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });

                const isCurrentAction = actionLoading === order._id;

                return (
                  <div
                    key={order._id}
                    className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs hover:border-orange-200 transition space-y-4"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-xs text-gray-500">
                            #{order._id.slice(-6).toUpperCase()}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Placed on {dateStr}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-gray-400">Total Bill</span>
                        <p className="text-lg font-bold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </div>
                    </div>

                    {/* Customer & Address Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800">Customer</p>
                        <p className="text-gray-600">{order.user?.name || 'Customer'}</p>
                        {order.user?.phone && (
                          <p className="text-gray-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {order.user.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-gray-800">Delivery Address</p>
                        <p className="text-gray-600 flex items-start gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-orange-500 mt-0.5" />
                          <span>{order.deliveryAddress}</span>
                        </p>
                      </div>
                    </div>

                    {/* Ordered Items Table */}
                    <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 text-xs">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="p-2.5 flex items-center justify-between">
                          <span className="font-semibold text-gray-800">
                            {it.quantity}x {it.name}
                          </span>
                          <span className="font-medium text-gray-600">
                            {formatPrice(it.price * it.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Buttons following backend state machine */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                      {/* Pending status: Accept or Reject */}
                      {order.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => {
                              setOrderToReject(order);
                              setRejectModalOpen(true);
                            }}
                            disabled={isCurrentAction}
                            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleAccept(order._id)}
                            disabled={isCurrentAction}
                            className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            {isCurrentAction ? 'Accepting...' : 'Accept Order'}
                          </button>
                        </>
                      )}

                      {/* Accepted status: Mark Preparing */}
                      {order.status === 'Accepted' && (
                        <button
                          onClick={() => handleProgressStatus(order._id, 'Preparing')}
                          disabled={isCurrentAction}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50"
                        >
                          <ChefHat className="w-4 h-4" />
                          {isCurrentAction ? 'Updating...' : 'Start Preparing'}
                        </button>
                      )}

                      {/* Preparing status: Mark Out for Delivery */}
                      {order.status === 'Preparing' && (
                        <button
                          onClick={() => handleProgressStatus(order._id, 'Out for Delivery')}
                          disabled={isCurrentAction}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition disabled:opacity-50"
                        >
                          <Truck className="w-4 h-4" />
                          {isCurrentAction ? 'Updating...' : 'Send Out for Delivery'}
                        </button>
                      )}

                      {/* Out for Delivery status: Mark Delivered */}
                      {order.status === 'Out for Delivery' && (
                        <button
                          onClick={() => handleProgressStatus(order._id, 'Delivered')}
                          disabled={isCurrentAction}
                          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {isCurrentAction ? 'Updating...' : 'Mark as Delivered'}
                        </button>
                      )}
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
        </main>
      </div>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={rejectModalOpen}
        title="Reject Order"
        message={`Are you sure you want to reject order #${orderToReject?._id.slice(-6).toUpperCase()}? This will notify the customer.`}
        confirmLabel="Reject Order"
        isDangerous
        loading={actionLoading === orderToReject?._id}
        onConfirm={handleConfirmReject}
        onCancel={() => {
          setRejectModalOpen(false);
          setOrderToReject(null);
        }}
      />
    </div>
  );
}

export default function OwnerOrdersPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <Suspense fallback={<Loading fullScreen text="Loading orders..." />}>
        <OwnerOrdersContent />
      </Suspense>
    </RoleGuard>
  );
}
