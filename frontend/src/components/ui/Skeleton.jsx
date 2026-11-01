import React from 'react';

export default function Skeleton({
  className = '',
  rows = 1,
  height = 'h-4'
}) {
  if (rows > 1) {
    return (
      <div className="space-y-3 w-full">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`w-full ${height} rounded-xs skeleton-shimmer ${className}`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full ${height} rounded-xs skeleton-shimmer ${className}`} />
  );
}

