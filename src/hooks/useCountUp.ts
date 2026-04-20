import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function useCountUp(
  targetValue: number,
  options: UseCountUpOptions = {}
): string {
  const { duration = 600, decimals = 0, prefix = '', suffix = '' } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const previousValue = useRef(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const startValue = previousValue.current;
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (targetValue - startValue) * easeOut;
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = targetValue;
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  const formattedValue = decimals > 0 
    ? displayValue.toFixed(decimals) 
    : Math.round(displayValue).toString();
  
  return `${prefix}${formattedValue}${suffix}`;
}
