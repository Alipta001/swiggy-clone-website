'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/lib/api';
import RoleGuard from '@/components/RoleGuard';
import AdminSidebar from '@/components/AdminSidebar';
import Loading from '@/components/Loading';
import EmptyState from '@/components/EmptyState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { toast } from 'react-toastify';
import {
  Users,
  Search,
  ShieldBan,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone
} from 'lucide-react';

function UserManagementContent() {
  const { user: currentUser, adminSecret } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isBlocked, setIsBlocked] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Block/Unblock Dialog
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    user: null,
    action: 'block' // 'block' or 'unblock'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (role) params.role = role;
      if (isBlocked !== '') params.isBlocked = isBlocked;

      const res = await adminAPI.getUsers(params);
      if (res?.data) {
        setUsers(res.data);
        setTotalPages(res.totalPages || 1);
        setTotalItems(res.totalItems || 0);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, role, isBlocked]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, adminSecret]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleBlockToggle = async () => {
    const { user: targetUser, action } = confirmDialog;
    if (!targetUser) return;

    setActionLoading(true);
    try {
      if (action === 'block') {
        await adminAPI.blockUser(targetUser._id);
        toast.success(`User ${targetUser.email} has been blocked`);
      } else {
        await adminAPI.unblockUser(targetUser._id);
        toast.success(`User ${targetUser.email} has been unblocked`);
      }
      setConfirmDialog({ isOpen: false, user: null, action: 'block' });
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user status';
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <AdminSidebar />

        <main className="flex-1 space-y-6">
          <div className="border-b border-gray-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-xs text-gray-500 mt-0.5">
                Total registered platform accounts: {totalItems}
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
                  placeholder="Search name/email..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
                />
              </form>

              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="owner">Restaurant Owner</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={isBlocked}
                onChange={(e) => {
                  setIsBlocked(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition"
              >
                <option value="">All Statuses</option>
                <option value="false">Active Only</option>
                <option value="true">Blocked Only</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loading text="Loading user directory..." />
          ) : users.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No users found"
              description="No accounts match your current filter parameters."
            />
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-100">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {users.map((u) => {
                      const isSelf = u._id === currentUser?.id;

                      return (
                        <tr key={u._id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-bold text-gray-900">{u.name}</p>
                              <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" /> {u.email}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {u.phone || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'admin'
                                  ? 'bg-red-100 text-red-800'
                                  : u.role === 'owner'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                u.isBlocked
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {u.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isSelf ? (
                              <span className="text-[11px] text-gray-400 font-medium">
                                (You)
                              </span>
                            ) : u.isBlocked ? (
                              <button
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    user: u,
                                    action: 'unblock'
                                  })
                                }
                                className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition"
                              >
                                Unblock
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setConfirmDialog({
                                    isOpen: true,
                                    user: u,
                                    action: 'block'
                                  })
                                }
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition"
                              >
                                Block
                              </button>
                            )}
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.action === 'block' ? 'Block User Account' : 'Unblock User Account'}
        message={
          confirmDialog.action === 'block'
            ? `Are you sure you want to block ${confirmDialog.user?.email}? They will no longer be able to log in or use the platform.`
            : `Are you sure you want to restore access for ${confirmDialog.user?.email}?`
        }
        confirmLabel={confirmDialog.action === 'block' ? 'Block User' : 'Unblock User'}
        isDangerous={confirmDialog.action === 'block'}
        loading={actionLoading}
        onConfirm={handleBlockToggle}
        onCancel={() => setConfirmDialog({ isOpen: false, user: null, action: 'block' })}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <RoleGuard allowedRoles={['admin']}>
      <UserManagementContent />
    </RoleGuard>
  );
}
