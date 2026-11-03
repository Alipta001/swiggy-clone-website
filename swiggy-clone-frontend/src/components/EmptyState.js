'use client';

import React from 'react';
import Link from 'next/link';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description = 'There is nothing to display here right now.',
  actionLabel,
  actionHref,
  onAction
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white border border-gray-100 rounded-xl my-6">
      {Icon && (
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="mt-1 text-sm text-gray-500 max-w-md">{description}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionHref && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
