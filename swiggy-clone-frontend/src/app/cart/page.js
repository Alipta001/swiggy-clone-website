'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import ProtectedRoute from '@/components/ProtectedRoute';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  Store,
  ArrowRight,
  ShieldCheck,
  UtensilsCrossed
} from 'lucide-react';

function CartView() {
  const router = useRouter();
  const { cart, items, subtotal, totalAmount, restaurant, updateQuantity, removeItem, clearCart, fetchCart } = useCart();
  const { user } = useAuth();

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearCart = async () => {
    setClearing(true);
    try {
      await clearCart();
      toast.success('Cart cleared');
      setShowClearConfirm(false);
    } catch (err) {
      toast.error('Failed to clear cart');
    } finally {
      setClearing(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
      toast.error('Please enter a delivery address (at least 5 characters)');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacingOrder(true);
    try {
      const res = await orderAPI.createOrder({
        deliveryAddress: deliveryAddress.trim(),
        paymentMethod
      });

      toast.success('Order placed successfully!');
      await fetchCart(); // Sync empty cart
      const orderId = res.data?._id;
      if (orderId) {
        router.push(`/orders/${orderId}`);
      } else {
        router.push('/orders');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to place order. Please try again.';
      toast.error(msg);
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="Looks like you haven't added anything to your cart yet. Discover great restaurants and dishes!"
          actionLabel="Explore Restaurants"
          actionHref="/restaurants"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Clear Cart */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          {restaurant?.name && (
            <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-orange-500" />
              Ordering from: <span className="font-semibold text-gray-700">{restaurant.name}</span>
            </p>
          )}
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs divide-y divide-gray-100">
            {items.map((item) => {
              const food = item.food;
              if (!food) return null;

              return (
                <div key={food._id} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4">
                  {/* Food Image */}
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden relative shrink-0">
                    {food.image ? (
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div
                      className={`w-full h-full flex items-center justify-center bg-orange-50 text-orange-400 ${
                        food.image ? 'hidden' : ''
                      }`}
                    >
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Food Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 border flex items-center justify-center rounded-2xs ${
                          food.isVeg ? 'border-emerald-600' : 'border-red-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            food.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {food.name}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 font-medium">
                      {formatPrice(food.price)} each
                    </p>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-1 text-gray-700">
                    <button
                      onClick={() => updateQuantity(food._id, item.quantity - 1)}
                      className="p-1 hover:bg-white rounded-md text-gray-600 transition"
                      title="Decrease"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(food._id, item.quantity + 1)}
                      className="p-1 hover:bg-white rounded-md text-gray-600 transition"
                      title="Increase"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right w-20">
                    <p className="text-sm font-bold text-gray-900">
                      {formatPrice(item.itemTotal || food.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeItem(food._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Checkout & Summary Sidebar */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              Order Summary
            </h2>

            {/* Bill Details (computed by backend) */}
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-emerald-600 font-semibold">FREE</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between text-sm font-bold text-gray-900">
                <span>Total Amount</span>
                <span className="text-orange-600 text-base">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Form */}
            <form onSubmit={handlePlaceOrder} className="space-y-4 pt-2 border-t border-gray-100">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  Delivery Address *
                </label>
                <textarea
                  rows={3}
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter your complete delivery address (flat/house no., street, landmark)..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-orange-500" />
                  Payment Method
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Cash on Delivery (COD)</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                    Default
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placingOrder}
                className="w-full py-3.5 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {placingOrder ? 'Placing Order...' : `Place Order • ${formatPrice(totalAmount)}`}
                {!placingOrder && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Backend Calculation & COD checkout
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Clear Cart Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        title="Clear Shopping Cart"
        message="Are you sure you want to remove all items from your cart?"
        confirmLabel="Clear Cart"
        isDangerous
        loading={clearing}
        onConfirm={handleClearCart}
        onCancel={() => setShowClearConfirm(false)}
      />
    </div>
  );
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CartView />
    </ProtectedRoute>
  );
}
