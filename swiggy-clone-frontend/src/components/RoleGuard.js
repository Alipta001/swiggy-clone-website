'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from './Loading';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function RoleGuard({
  allowedRoles = [],
  children,
  fallbackHref = '/'
}) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const isRoleAllowed = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (!isRoleAllowed) {
        // Redirection to appropriate landing page
        if (user.role === 'admin') router.replace('/admin');
        else if (user.role === 'owner') router.replace('/dashboard');
        else router.replace(fallbackHref);
      }
    }
  }, [isAuthenticated, isRoleAllowed, loading, router, user, fallbackHref]);

  if (loading) {
    return <Loading fullScreen text="Verifying permissions..." />;
  }

  if (!isAuthenticated || !isRoleAllowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white border border-gray-100 rounded-xl p-8 max-w-md w-full text-center shadow-xs">
          <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="mt-2 text-sm text-gray-600">
            You do not have permission to access this page with your current role ({user?.role || 'Guest'}).
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
