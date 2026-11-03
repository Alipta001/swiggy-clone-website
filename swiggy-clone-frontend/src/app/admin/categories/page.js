'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { categoryAPI } from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  Utensils
} from 'lucide-react';

function AdminCategoriesContent() {
  const { adminSecret } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  });

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getCategories();
      if (res?.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, adminSecret]);

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', image: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || '',
      description: cat.description || '',
      image: cat.image || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCategory) {
        await categoryAPI.updateCategory(editingCategory._id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim()
        });
        toast.success('Category updated successfully');
      } else {
        await categoryAPI.createCategory({
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image.trim()
        });
        toast.success('Category created successfully');
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save category';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await categoryAPI.deleteCategory(categoryToDelete._id);
      toast.success('Category deleted successfully');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Create and organize global dish categories used across all restaurants
              </p>
            </div>

            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition shadow-xs self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {loading ? (
            <Loading text="Loading categories..." />
          ) : categories.length === 0 ? (
            <EmptyState
              icon={Layers}
              title="No categories created"
              description="Start organizing the menu by creating your first food category."
              actionLabel="Create Category"
              onAction={handleOpenAdd}
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">Icon / Image</th>
                      <th className="py-3 px-4">Category Name</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-gray-50/50 transition">
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 rounded-full bg-orange-100/60 overflow-hidden flex items-center justify-center shrink-0">
                            {cat.image ? (
                              <img
                                src={cat.image}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Utensils className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          {cat.name}
                        </td>
                        <td className="py-3 px-4 text-gray-500 max-w-xs truncate">
                          {cat.description || 'No description provided'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setCategoryToDelete(cat);
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

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative border border-gray-100">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Requires valid admin authorization and secret key
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g. Biryani, Pizzas, Desserts"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Icon / Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, image: e.target.value }))
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Short summary of this food category..."
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs disabled:opacity-60"
                >
                  {submitting
                    ? 'Saving...'
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Note that if any food items are currently attached to this category, deletion will be blocked by the server.`}
        confirmLabel="Delete Category"
        isDangerous
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
      />
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <AdminCategoriesContent />
    </RoleGuard>
  );
}
