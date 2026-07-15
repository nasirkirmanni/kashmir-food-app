"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { resolveImageUrl, getImageSrcSet, getImagePlaceholder, getActiveProvider } from "@/lib/imageUtils";

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
  // Provider-specific transformation options
  imgWidth,
  imgHeight,
  imgCrop,
  imgGravity,
  imgFormat,
  imgQuality,
  imgDpr,
  // Srcset configuration
  srcsetWidths,
  // Placeholder
  placeholder = "blur",
  // Fallback
  fallback = "/wazwan-hero.jpg",
  ...props
}) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(!priority);
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(src, fallback));
  const [placeholderSrc, setPlaceholderSrc] = useState(() => getImagePlaceholder(src));
  const activeProvider = getActiveProvider();

  // Build transformation options from props
  const transformOptions = useMemo(() => ({
    width: imgWidth,
    height: imgHeight,
    crop: imgCrop,
    gravity: imgGravity,
    format: imgFormat,
    quality: imgQuality,
    dpr: imgDpr,
  }), [imgWidth, imgHeight, imgCrop, imgGravity, imgFormat, imgQuality, imgDpr]);

  // Generate srcset if supported and not provided manually
  const srcset = useMemo(() => {
    if (sizes && !srcsetWidths) return undefined;
    if (!src) return undefined;
    return getImageSrcSet(src, srcsetWidths, transformOptions);
  }, [src, sizes, srcsetWidths, transformOptions]);

  // Update when src changes
  useEffect(() => {
    if (src !== prevSrc) {
      setPrevSrc(src);
      setImgSrc(resolveImageUrl(src, fallback, transformOptions));
      setPlaceholderSrc(getImagePlaceholder(src));
      setIsLoading(!priority);
    }
  }, [src, prevSrc, fallback, transformOptions, priority]);

  // Determine if we should use blur placeholder
  const useBlurPlaceholder = placeholder === "blur" && placeholderSrc && activeProvider === 'cloudinary';

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
        alt={alt || ""}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        srcSet={srcset}
        priority={priority}
        placeholder={useBlurPlaceholder ? "blur" : undefined}
        blurDataURL={useBlurPlaceholder ? placeholderSrc : undefined}
        className={`relative z-10 transition-opacity duration-500 ease-in-out ${isLoading ? "opacity-0" : "opacity-100"} ${className}`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setImgSrc(fallback);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}