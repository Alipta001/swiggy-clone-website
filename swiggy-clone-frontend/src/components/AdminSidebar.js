'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  Layers,
  KeyRound,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, adminSecret, updateAdminSecret, logout } = useAuth();
  const [keyInput, setKeyInput] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const handleSaveSecret = (e) => {
    e.preventDefault();
    if (!keyInput.trim()) {
      toast.error('Please enter the secret key');
      return;
    }
    updateAdminSecret(keyInput.trim());
    toast.success('Admin secret key saved for current session');
    setShowKeyModal(false);
    setKeyInput('');
  };

  const navItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Restaurants', href: '/admin/restaurants', icon: Store },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Categories', href: '/admin/categories', icon: Layers }
  ];

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      <aside className="w-full md:w-64 bg-white border border-gray-100 rounded-2xl p-4 shadow-xs shrink-0 self-start space-y-6">
        {/* Profile Card */}
        <div className="p-3 bg-red-50/70 rounded-xl border border-red-100">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Admin Console
          </div>
          <p className="text-sm font-bold text-gray-900 truncate mt-1">
            {user?.name || 'Administrator'}
          </p>
          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
        </div>

        {/* Admin Secret Status */}
        <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700">Admin Secret:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                adminSecret
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {adminSecret ? 'Configured' : 'Missing'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setKeyInput(adminSecret || '');
              setShowKeyModal(true);
            }}
            className="mt-2 text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1"
          >
            <KeyRound className="w-3.5 h-3.5" />
            {adminSecret ? 'Update Secret Key' : 'Enter Secret Key'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-red-600 text-white shadow-2xs'
                    : 'text-gray-600 hover:text-red-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="pt-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-xs font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Admin Secret Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Admin Secret Key
                </h3>
                <p className="text-xs text-gray-500">
                  Required to authorize administrative API requests
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSecret} className="space-y-4 text-xs mt-4">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1">
                  Secret Key
                </label>
                <input
                  type="password"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter x-admin-secret"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-red-500 transition text-sm font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-xs"
                >
                  Save Secret Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
