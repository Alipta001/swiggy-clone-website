'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import ProtectedRoute from '@/components/ProtectedRoute';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  CreditCard,
  ChefHat,
  ShoppingBag
} from 'lucide-react';

function OrderDetailView({ id }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getOrderById(id);
      if (res?.data) {
        setOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to load order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await orderAPI.cancelOrder(id);
      toast.success('Order cancelled successfully');
      setCancelModalOpen(false);
      fetchOrder();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to cancel order';
      toast.error(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading order details..." />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          icon={ShoppingBag}
          title="Order Not Found"
          description="The requested order does not exist or you do not have permission to view it."
          actionLabel="View My Orders"
          actionHref="/orders"
        />
      </div>
    );
  }

  const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      {/* Order Status Banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Order #{order._id.slice(-8).toUpperCase()}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  order.status === 'Delivered'
                    ? 'bg-emerald-100 text-emerald-800'
                    : order.status === 'Cancelled' || order.status === 'Rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-orange-100 text-orange-800'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Placed on {dateStr}
            </p>
          </div>

          {order.status === 'Pending' && (
            <button
              onClick={() => setCancelModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition self-start sm:self-center"
            >
              Cancel Order
            </button>
          )}
        </div>

        {/* Restaurant Details */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              {order.restaurant?.name || 'Restaurant'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {order.restaurant?.address}
            </p>
            {order.restaurant?.phone && (
              <p className="text-xs text-gray-400 mt-0.5">
                Contact: {order.restaurant.phone}
              </p>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider text-xs">
            Items Ordered ({order.items?.length || 0})
          </h3>
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700">
                    {item.quantity}x
                  </span>
                  <span className="font-semibold text-gray-900">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 mr-2">
                    {formatPrice(item.price)} each
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total & Delivery Address */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Address & Payment Info */}
          <div className="p-4 border border-gray-100 rounded-xl space-y-3 text-xs">
            <div>
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                Delivery Address
              </span>
              <p className="text-gray-600 leading-relaxed">{order.deliveryAddress}</p>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-700 uppercase tracking-wider text-[11px] flex items-center gap-1 mb-1">
                <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                Payment Information
              </span>
              <p className="text-gray-600">
                Method: <span className="font-semibold">{order.paymentMethod || 'COD'}</span>
              </p>
              <p className="text-gray-600">
                Payment Status:{' '}
                <span
                  className={`font-semibold ${
                    order.paymentStatus === 'Paid'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
            </div>
          </div>

          {/* Bill Breakdown */}
          <div className="p-4 bg-gray-50 rounded-xl space-y-2 text-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(order.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
              <span>Total Amount</span>
              <span className="text-orange-600">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be reversed."
        confirmLabel="Confirm Cancellation"
        isDangerous
        loading={cancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalOpen(false)}
      />
    </div>
  );
}

function OrderParamsWrapper({ params }) {
  const unwrappedParams = use(params);
  return <OrderDetailView id={unwrappedParams.id} />;
}

export default function OrderDetailsPage(props) {
  return (
    <ProtectedRoute>
      <React.Suspense fallback={<Loading fullScreen text="Loading order..." />}>
        <OrderParamsWrapper {...props} />
      </React.Suspense>
    </ProtectedRoute>
  );
}
