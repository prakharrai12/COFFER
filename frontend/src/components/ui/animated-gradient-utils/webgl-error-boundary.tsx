import React, { Component, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   WebGLErrorBoundary
   Class component that catches WebGL render errors from its
   children and renders a fallback instead.
   ───────────────────────────────────────────────────────── */

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface WebGLErrorBoundaryState {
  hasError: boolean;
}

export class WebGLErrorBoundary extends Component<
  WebGLErrorBoundaryProps,
  WebGLErrorBoundaryState
> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): WebGLErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.warn(
      '[WebGLErrorBoundary] WebGL render failed, falling back to CSS gradient.',
      error,
      errorInfo,
    );
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/* ─────────────────────────────────────────────────────────
   WebGLFallback
   Static CSS gradient using Coffer's brand tokens as a safe
   degrade — looks intentional on its own, not like a broken
   state. Used when WebGL2 is unavailable.
   ───────────────────────────────────────────────────────── */

interface WebGLFallbackProps {
  className?: string;
}

export function WebGLFallback({ className }: WebGLFallbackProps) {
  return (
    <div
      className={cn('absolute inset-0 overflow-hidden', className)}
      aria-hidden="true"
    >
      {/* Primary gradient — charcoal → vault green → brand-light */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(135deg, #141614 0%, #1F5F4D 55%, #2D8A70 100%)',
        }}
      />

      {/* Subtle radial highlight overlay — adds depth so it doesn't read flat */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, rgba(45, 138, 112, 0.25) 0%, transparent 60%)',
        }}
      />

      {/* Secondary radial for edge warmth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 80%, rgba(31, 95, 77, 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Fine grain noise texture — paper feel */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  );
}
