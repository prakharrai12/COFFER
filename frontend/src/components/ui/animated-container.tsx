import React, { useRef, useEffect, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ─────────────────────────────────────────────────────────
   AnimatedContainer — Shared scroll-reveal wrapper
   
   Fade-in with opacity 0→1, blur 4px→0, translateY 6px→0.
   Accepts a `delay` prop for staggering reveals.
   Respects prefers-reduced-motion — renders children 
   immediately with no animation when set.
   ───────────────────────────────────────────────────────── */

interface AnimatedContainerProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return reduced;
}

export default function AnimatedContainer({
  children,
  delay = 0,
  className,
}: AnimatedContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [reducedMotion]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(4px)',
        transform: isVisible ? 'translateY(0)' : 'translateY(6px)',
        transition: reducedMotion
          ? 'none'
          : `opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, filter 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
        willChange: isVisible ? 'auto' : 'opacity, filter, transform',
      }}
    >
      {children}
    </div>
  );
}

export { type AnimatedContainerProps };
