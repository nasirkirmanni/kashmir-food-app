"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/imageUtils";

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
  const [prevSrc, setPrevSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(!priority);
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(src));

  if (src !== prevSrc) {
    setPrevSrc(src);
    setImgSrc(resolveImageUrl(src));
    setIsLoading(!priority);
  }

  return (
    <div
      className={`relative overflow-hidden bg-white/5 ${fill ? "w-full h-full" : ""} ${containerClassName}`}
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
        className={`relative z-10 transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"} ${className}`}
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
