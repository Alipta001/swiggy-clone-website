'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { restaurantAPI } from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import OwnerSidebar from '@/components/OwnerSidebar';
import Loading from '@/components/Loading';
import { toast } from 'react-toastify';
import { Store, MapPin, Image, Check, AlertCircle } from 'lucide-react';

function RestaurantManageView() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    image: '',
    cuisine: '',
    isOpen: true
  });

  const fetchRestaurant = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await restaurantAPI.getRestaurants({ owner: user.id });
      const myRest = res?.data?.[0] || null;
      setRestaurant(myRest);

      if (myRest) {
        setFormData({
          name: myRest.name || '',
          description: myRest.description || '',
          address: myRest.address || '',
          image: myRest.image || '',
          cuisine: Array.isArray(myRest.cuisine) ? myRest.cuisine.join(', ') : myRest.cuisine || '',
          isOpen: myRest.isOpen ?? true
        });
      }
    } catch (err) {
      console.error('Failed to fetch restaurant', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurant();
  }, [user]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleToggleStatus = async () => {
    if (!restaurant) return;
    setStatusLoading(true);
    try {
      const newStatus = !restaurant.isOpen;
      await restaurantAPI.updateStatus(restaurant._id, { isOpen: newStatus });
      setRestaurant((prev) => ({ ...prev, isOpen: newStatus }));
      setFormData((prev) => ({ ...prev, isOpen: newStatus }));
      toast.success(`Restaurant is now ${newStatus ? 'OPEN' : 'CLOSED'}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status';
      toast.error(msg);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) {
      toast.error('Restaurant name and address are required');
      return;
    }

    const cuisineArray = formData.cuisine
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    setSaving(true);
    try {
      if (restaurant) {
        // Update existing restaurant
        const res = await restaurantAPI.updateRestaurant(restaurant._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          image: formData.image.trim(),
          cuisine: cuisineArray,
          isOpen: formData.isOpen
        });
        setRestaurant(res.data);
        toast.success('Restaurant information updated successfully!');
      } else {
        // Create new restaurant
        const res = await restaurantAPI.createRestaurant({
          name: formData.name.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          image: formData.image.trim(),
          cuisine: cuisineArray,
          isOpen: formData.isOpen
        });
        setRestaurant(res.data);
        toast.success('Restaurant created successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save restaurant details';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {restaurant ? 'My Restaurant Settings' : 'Register Your Restaurant'}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                {restaurant
                  ? 'Update restaurant information, address, cuisine types, and toggle opening status'
                  : 'Complete the form below to register your restaurant on Swiggy Clone'}
              </p>
            </div>

            {restaurant && (
              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition shadow-2xs ${
                  restaurant.isOpen
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {statusLoading
                  ? 'Updating...'
                  : restaurant.isOpen
                  ? 'Close Restaurant'
                  : 'Open Restaurant'}
              </button>
            )}
          </div>

          {loading ? (
            <Loading text="Loading restaurant information..." />
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Spice Garden"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                    Cuisines (comma separated)
                  </label>
                  <input
                    type="text"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    placeholder="e.g. North Indian, Biryani, Mughlai"
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Physical Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. 124 Park Street, Kolkata, WB"
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers about your kitchen and specialty dishes..."
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isOpen"
                  name="isOpen"
                  checked={formData.isOpen}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500 rounded-sm focus:ring-orange-400"
                />
                <label htmlFor="isOpen" className="text-xs font-semibold text-gray-800 cursor-pointer">
                  Accept orders immediately (Open status)
                </label>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-60"
                >
                  {saving
                    ? 'Saving Changes...'
                    : restaurant
                    ? 'Update Restaurant Details'
                    : 'Create Restaurant'}
                </button>
              </div>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}

export default function MyRestaurantPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <RestaurantManageView />
    </RoleGuard>
  );
}
