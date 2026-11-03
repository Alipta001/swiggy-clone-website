'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { restaurantAPI, foodAPI, categoryAPI } from '@/lib/api';
import { formatPrice } from '@/utils/formatPrice';
import RoleGuard from '@/components/RoleGuard';
import OwnerSidebar from '@/components/OwnerSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  UtensilsCrossed,
  Plus,
  Pencil,
  Trash2,
  Store,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

function ManageFoodsView() {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [foodToDelete, setFoodToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const initialForm = {
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    isVeg: true,
    isAvailable: true
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [restRes, catRes] = await Promise.all([
        restaurantAPI.getRestaurants({ owner: user.id }),
        categoryAPI.getCategories()
      ]);

      const myRest = restRes?.data?.[0] || null;
      setRestaurant(myRest);

      if (catRes?.data) {
        setCategories(catRes.data);
      }

      if (myRest) {
        const foodsRes = await foodAPI.getFoods({
          restaurant: myRest._id,
          limit: 100
        });
        if (foodsRes?.data) {
          setFoods(foodsRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to load menu items', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAddModal = () => {
    setEditingFood(null);
    setFormData({
      ...initialForm,
      category: categories[0]?._id || ''
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (food) => {
    setEditingFood(food);
    setFormData({
      name: food.name || '',
      description: food.description || '',
      price: food.price || '',
      image: food.image || '',
      category: food.category?._id || food.category || '',
      isVeg: Boolean(food.isVeg),
      isAvailable: Boolean(food.isAvailable)
    });
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price === '' || !formData.category) {
      toast.error('Name, price, and category are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingFood) {
        // Update food
        await foodAPI.updateFood(editingFood._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          image: formData.image.trim(),
          category: formData.category,
          isVeg: formData.isVeg,
          isAvailable: formData.isAvailable
        });
        toast.success('Food item updated successfully');
      } else {
        // Create food
        await foodAPI.createFood({
          name: formData.name.trim(),
          description: formData.description.trim(),
          price: Number(formData.price),
          image: formData.image.trim(),
          restaurant: restaurant._id,
          category: formData.category,
          isVeg: formData.isVeg,
          isAvailable: formData.isAvailable
        });
        toast.success('Food item created successfully');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save food item';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleAvailability = async (food) => {
    try {
      const newAvail = !food.isAvailable;
      await foodAPI.updateAvailability(food._id, newAvail);
      setFoods((prev) =>
        prev.map((f) => (f._id === food._id ? { ...f, isAvailable: newAvail } : f))
      );
      toast.success(
        `"${food.name}" marked as ${newAvail ? 'Available' : 'Unavailable'}`
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update availability';
      toast.error(msg);
    }
  };

  const handleDeleteFood = async () => {
    if (!foodToDelete) return;
    setDeleting(true);
    try {
      await foodAPI.deleteFood(foodToDelete._id);
      toast.success('Food item deleted successfully');
      setDeleteModalOpen(false);
      setFoodToDelete(null);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete food item';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <OwnerSidebar />

        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Menu Items</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Add, modify, remove, and toggle availability of food items in your restaurant
              </p>
            </div>

            {restaurant && (
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-center"
              >
                <Plus className="w-4 h-4" />
                Add Food Item
              </button>
            )}
          </div>

          {loading ? (
            <Loading text="Loading your restaurant menu..." />
          ) : !restaurant ? (
            <EmptyState
              icon={Store}
              title="Restaurant Needed"
              description="Please register your restaurant before managing menu items."
              actionLabel="Create Restaurant"
              actionHref="/dashboard/restaurant"
            />
          ) : foods.length === 0 ? (
            <EmptyState
              icon={UtensilsCrossed}
              title="No food items in your menu"
              description="Start building your digital menu by clicking 'Add Food Item'."
              actionLabel="Add Food Item"
              onAction={handleOpenAddModal}
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Item</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Diet</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Availability</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {foods.map((food) => (
                      <tr key={food._id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                              {food.image ? (
                                <img
                                  src={food.image}
                                  alt={food.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-50 text-orange-400">
                                  <UtensilsCrossed className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 truncate max-w-[180px]">
                                {food.name}
                              </p>
                              {food.description && (
                                <p className="text-[11px] text-gray-400 truncate max-w-[200px]">
                                  {food.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-sm text-[11px] font-medium">
                            {food.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                              food.isVeg ? 'text-emerald-700' : 'text-red-700'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                food.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                              }`}
                            />
                            {food.isVeg ? 'Veg' : 'Non-Veg'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {formatPrice(food.price)}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(food)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition ${
                              food.isAvailable
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                            }`}
                          >
                            {food.isAvailable ? 'In Stock' : 'Out of Stock'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(food)}
                              className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setFoodToDelete(food);
                                setDeleteModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add / Edit Food Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editingFood ? 'Edit Food Item' : 'Add New Food Item'}
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Fill in the details for this dish on your menu
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Food Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="249"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleFormChange}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Ingredients, preparation style, spice level..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition resize-none"
                />
              </div>

              {/* Checkboxes: Veg and Available */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                  <input
                    type="checkbox"
                    name="isVeg"
                    checked={formData.isVeg}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500"
                  />
                  Vegetarian Dish
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-800">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-orange-500 rounded-sm focus:ring-orange-400"
                  />
                  Currently Available
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition disabled:opacity-60"
                >
                  {submitting
                    ? 'Saving...'
                    : editingFood
                    ? 'Update Item'
                    : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Food Item"
        message={`Are you sure you want to permanently delete "${foodToDelete?.name}"?`}
        confirmLabel="Delete"
        isDangerous
        loading={deleting}
        onConfirm={handleDeleteFood}
        onCancel={() => {
          setDeleteModalOpen(false);
          setFoodToDelete(null);
        }}
      />
    </div>
  );
}

export default function ManageFoodsPage() {
  return (
    <RoleGuard allowedRoles={['owner', 'admin']}>
      <ManageFoodsView />
    </RoleGuard>
  );
}
