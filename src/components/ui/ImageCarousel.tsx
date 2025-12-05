'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageCarouselProps {
  images: Array<{
    src: string;
    alt: string;
  }>;
  autoPlayInterval?: number; // 自动轮播间隔（毫秒）
  className?: string;
}

const ImageCarousel = ({ 
  images, 
  autoPlayInterval = 3000,
  className 
}: ImageCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播
  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [images.length, autoPlayInterval]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className={cn(
        "w-full h-full flex items-center justify-center bg-muted/30 rounded-xl",
        className
      )}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full group", className)}>
      {/* 轮播图片 */}
      <div className="relative w-full h-full overflow-hidden rounded-xl">
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 w-full h-full transition-all duration-500 ease-in-out",
              index === currentIndex 
                ? "opacity-100 translate-x-0" 
                : index < currentIndex 
                  ? "opacity-0 -translate-x-full" 
                  : "opacity-0 translate-x-full"
            )}
          >
            <img
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
        ))}
      </div>

      {/* 左右切换按钮 - 只在有多张图片时显示 */}
      {images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2",
              "w-8 h-8 flex items-center justify-center",
              "bg-background/80 hover:bg-background",
              "border border-border rounded-full",
              "opacity-0 group-hover:opacity-100",
              "transition-all duration-300",
              "backdrop-blur-sm shadow-lg",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>

          <button
            onClick={goToNext}
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2",
              "w-8 h-8 flex items-center justify-center",
              "bg-background/80 hover:bg-background",
              "border border-border rounded-full",
              "opacity-0 group-hover:opacity-100",
              "transition-all duration-300",
              "backdrop-blur-sm shadow-lg",
              "hover:scale-110 active:scale-95"
            )}
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </>
      )}

      {/* 指示器点 - 只在有多张图片时显示 */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentIndex 
                  ? "bg-primary w-6" 
                  : "bg-muted-foreground/50 hover:bg-muted-foreground"
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 图片计数器 */}
      {images.length > 1 && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full border border-border shadow-lg">
          <span className="text-xs font-medium text-foreground">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
