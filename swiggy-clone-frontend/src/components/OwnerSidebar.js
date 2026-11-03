'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Store,
  UtensilsCrossed,
  ShoppingBag,
  LogOut
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'My Restaurant', href: '/dashboard/restaurant', icon: Store },
    { label: 'Manage Foods', href: '/dashboard/foods', icon: UtensilsCrossed },
    { label: 'Orders', href: '/dashboard/orders', icon: ShoppingBag }
  ];

  const isActive = (href) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-full md:w-64 bg-white border border-gray-100 rounded-2xl p-4 shadow-xs shrink-0 self-start space-y-6">
      {/* Header Profile Badge */}
      <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100">
        <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider">
          Owner Portal
        </p>
        <p className="text-sm font-bold text-gray-900 truncate mt-0.5">
          {user?.name || 'Restaurant Owner'}
        </p>
        <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
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
                  ? 'bg-orange-500 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
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
  );
}
