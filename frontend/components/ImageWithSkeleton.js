"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { resolveImageUrl, getImageSrcSet, getImagePlaceholder, getActiveProvider } from "@/lib/imageUtils";
import { isPlaceholderImage, placeholderFor } from "@/lib/contentImages";

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
  // Fallback (defaults to the dish/destination placeholder for content images,
  // so a failed dish photo never turns into an unrelated feast photo)
  fallback,
  ...props
}) {
  const fallbackSrc = fallback ?? placeholderFor(src) ?? "/wazwan-hero.jpg";
  const [prevSrc, setPrevSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(!priority);
  const [imgSrc, setImgSrc] = useState(() => resolveImageUrl(src, fallbackSrc));
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
      setImgSrc(resolveImageUrl(src, fallbackSrc, transformOptions));
      setPlaceholderSrc(getImagePlaceholder(src));
      setIsLoading(!priority);
    }
  }, [src, prevSrc, fallbackSrc, transformOptions, priority]);

  // Determine if we should use blur placeholder
  const useBlurPlaceholder = placeholder === "blur" && placeholderSrc && activeProvider === 'cloudinary';

  // A placeholder is an illustration, not a photo of the subject — say so.
  const imageAlt = isPlaceholderImage(imgSrc) ? (alt ? `${alt} — photo not available` : "") : alt || "";

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
        alt={imageAlt}
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
          setImgSrc(fallbackSrc);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}