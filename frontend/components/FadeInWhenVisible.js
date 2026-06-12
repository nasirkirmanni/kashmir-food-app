import React from 'react';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export default function FadeInWhenVisible({ children, className = '', delay = 0, yOffset = 20, scaleOffset = 1 }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1, once: true });

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : `translate3d(0, ${yOffset}px, 0) scale(${scaleOffset})`,
        transition: `opacity 0.8s ease-out ${delay}s, transform 0.8s ease-out ${delay}s`,
        willChange: 'opacity, transform'
      }}
    >
      {children}
    </div>
  );
}
