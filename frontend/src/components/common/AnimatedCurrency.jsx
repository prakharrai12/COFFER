import React, { useEffect, useState, useRef } from 'react';

// Custom cubic-bezier approximation for coffer-out (0.65, 0, 0.35, 1)
const easeCofferOut = (t) => {
  return 1 - Math.pow(1 - t, 3);
};

const AnimatedCurrency = ({
  value = 0,
  currency = '$ USD',
  duration = 600,
  className = '',
  showSign = false,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = typeof value === 'number' ? value : parseFloat(value) || 0;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeCofferOut(progress);

      const current = startValue + (endValue - startValue) * eased;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        prevValueRef.current = endValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  // Extract symbol from "currency string" e.g. "$ USD" -> "$", "€ EUR" -> "€", "₹ INR" -> "₹"
  const symbol = currency ? currency.split(' ')[0] : '$';
  const isNegative = displayValue < 0;
  const absValue = Math.abs(displayValue);

  const formattedNumber = absValue.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const signStr = isNegative ? '-' : showSign && displayValue > 0 ? '+' : '';

  return (
    <span className={`font-mono tabular-nums inline-flex items-baseline ${className}`}>
      <span className="opacity-75 mr-0.5 select-none">{signStr}{symbol}</span>
      <span>{formattedNumber}</span>
    </span>
  );
};

export default AnimatedCurrency;
