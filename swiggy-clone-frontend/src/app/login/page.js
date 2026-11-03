'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { UtensilsCrossed, Mail, Lock, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, updateAdminSecret } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    adminSecret: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password');
      return;
    }

    setLoading(true);
    try {
      const credentials = {
        email: formData.email.trim(),
        password: formData.password
      };
      if (formData.role) {
        credentials.role = formData.role;
      }

      const user = await login(credentials);

      // If user signed in as admin and provided secret key, store it immediately
      if (user.role === 'admin' && formData.adminSecret.trim()) {
        updateAdminSecret(formData.adminSecret.trim());
      }

      toast.success(`Welcome back, ${user.name}!`);

      // Redirect according to role
      if (user.role === 'admin') {
        router.push('/admin');
      } else if (user.role === 'owner') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to log in. Please check your credentials.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xs border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-orange-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-1 text-xs text-gray-500">
            Select your role and enter credentials to access your portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Select Role (Portal)
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition font-medium"
            >
              <option value="">Auto-Detect Role (Default)</option>
              <option value="user">Customer (Food Ordering)</option>
              <option value="owner">Restaurant Owner (Partner Portal)</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-gray-700 uppercase">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:border-orange-500 transition"
              />
            </div>
          </div>

          {/* Optional Admin Secret Key field if Admin role is selected */}
          {formData.role === 'admin' && (
            <div className="p-3 bg-red-50/60 rounded-xl border border-red-100 space-y-1">
              <label className="block text-xs font-semibold text-red-800 uppercase flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-red-600" />
                Admin Secret Key (Optional)
              </label>
              <input
                type="password"
                name="adminSecret"
                value={formData.adminSecret}
                onChange={handleChange}
                placeholder="Enter x-admin-secret"
                className="w-full px-3 py-2 text-xs bg-white border border-red-200 rounded-lg focus:outline-none focus:border-red-500 transition font-mono"
              />
              <p className="text-[10px] text-red-600">
                You can enter this now or later from the admin sidebar.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-orange-600 hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}
