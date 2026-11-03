'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  UtensilsCrossed,
  Store,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';

export default function Navbar() {
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const isActive = (path) => pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:bg-orange-600 transition">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black text-gray-900 tracking-tight leading-none group-hover:text-orange-500 transition">
                  Swiggy<span className="text-orange-500">Clone</span>
                </span>
                <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                  FOOD DELIVERY
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/')
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                Home
              </Link>
              <Link
                href="/restaurants"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/restaurants')
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                Restaurants
              </Link>
              <Link
                href="/foods"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/foods')
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                Foods
              </Link>
              <Link
                href="/categories"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/categories')
                    ? 'text-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                }`}
              >
                Categories
              </Link>

              {/* User orders link */}
              {isAuthenticated && !isOwner && !isAdmin && (
                <Link
                  href="/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/orders')
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  My Orders
                </Link>
              )}

              {/* Owner Dashboard link */}
              {isAuthenticated && isOwner && (
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.startsWith('/dashboard')
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Owner Dashboard
                </Link>
              )}

              {/* Admin Dashboard link */}
              {isAuthenticated && isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    pathname.startsWith('/admin')
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart Button (for users/unauthenticated) */}
            {!isOwner && (
              <Link
                href="/cart"
                className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                  isActive('/cart')
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'bg-gray-50 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Cart</span>
                {itemCount > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-xs font-bold ${
                      isActive('/cart')
                        ? 'bg-white text-orange-600'
                        : 'bg-orange-500 text-white'
                    }`}
                  >
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name ? user.name.slice(0, 2) : <UserIcon className="w-4 h-4" />}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-gray-800 leading-tight truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-gray-400 capitalize font-medium">
                      {user.role}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow-2xs transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {!isOwner && (
              <Link
                href="/cart"
                className="relative p-2 text-gray-700 hover:text-orange-600"
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated && (
            <div className="p-3 bg-gray-50 rounded-lg mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email} • <span className="capitalize text-orange-600 font-medium">{user?.role}</span></p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
            }`}
          >
            Home
          </Link>
          <Link
            href="/restaurants"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/restaurants') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
            }`}
          >
            Restaurants
          </Link>
          <Link
            href="/foods"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/foods') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
            }`}
          >
            Foods
          </Link>
          <Link
            href="/categories"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2 rounded-lg text-sm font-medium ${
              isActive('/categories') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
            }`}
          >
            Categories
          </Link>

          {isAuthenticated && !isOwner && !isAdmin && (
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive('/orders') ? 'text-orange-600 bg-orange-50' : 'text-gray-700'
              }`}
            >
              My Orders
            </Link>
          )}

          {isAuthenticated && isOwner && (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-600 bg-orange-50"
            >
              Owner Dashboard
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-orange-600 bg-orange-50"
            >
              Admin Dashboard
            </Link>
          )}

          {!isAuthenticated && (
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm font-medium text-white bg-orange-500 rounded-lg"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
