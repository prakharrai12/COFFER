import React from 'react';

export const HeroStatsSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-6 rounded-lg bg-surface border border-border">
        <div className="h-3 w-24 bg-border/60 rounded mb-4" />
        <div className="h-8 w-36 bg-border rounded mb-2" />
        <div className="h-3 w-16 bg-border/40 rounded" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="w-full rounded-lg border border-border bg-surface shadow-sm overflow-hidden animate-pulse">
    <div className="h-10 bg-surface-raised border-b border-border flex items-center px-4 gap-4">
      <div className="h-3 w-20 bg-border/60 rounded" />
      <div className="h-3 w-40 bg-border/60 rounded" />
      <div className="h-3 w-24 bg-border/60 rounded ml-auto" />
      <div className="h-3 w-20 bg-border/60 rounded" />
    </div>
    <div className="divide-y divide-border/50">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 flex items-center px-4 gap-4">
          <div className="h-3 w-20 bg-border/40 rounded" />
          <div className="h-3.5 w-48 bg-border/70 rounded" />
          <div className="h-3.5 w-24 bg-border rounded ml-auto" />
          <div className="h-6 w-20 bg-border/50 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export const BudgetBarSkeleton = ({ count = 4 }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-5 rounded-lg bg-surface border border-border">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-border/60" />
            <div className="h-4 w-32 bg-border rounded" />
          </div>
          <div className="h-4 w-24 bg-border rounded" />
        </div>
        <div className="h-2.5 w-full rounded-full bg-border/40 overflow-hidden">
          <div className="h-full w-1/3 bg-border rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="p-6 rounded-lg bg-surface border border-border animate-pulse">
    <div className="h-5 w-32 bg-border rounded mb-4" />
    <div className="h-40 w-full bg-border/30 rounded" />
  </div>
);
