"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageWithSkeleton({
  src,
  alt,
  fill,
  width,
  height,
  className = "",
  containerClassName = "",
  sizes,
  priority = false,
  ...props
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [imgSrc, setImgSrc] = useState(src || "/wazwan-hero.jpg");

  useEffect(() => {
    setImgSrc(src || "/wazwan-hero.jpg");
    setIsLoading(true);
  }, [src]);

  return (
    <div
      className={`relative overflow-hidden bg-white/5 ${containerClassName}`}
      style={!fill ? { width, height } : {}}
    >
      {/* Shimmer Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 z-0 animate-pulse bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}

      {/* Actual Image */}
      <Image
        src={imgSrc}
        alt={alt || "Image"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={`transition-opacity duration-500 ease-in-out ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc("/wazwan-hero.jpg");
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}
