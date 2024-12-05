"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProductComparisonProps {
  leftProduct: {
    name: string;
    image: string;
  };
  rightProduct: {
    name: string;
    image: string;
  };
}

export function ProductComparisonSlider({
  leftProduct,
  rightProduct,
}: ProductComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (event: MouseEvent | TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const x = "touches" in event ? event.touches[0].clientX : event.clientX;
    const position = ((x - containerRect.left) / containerRect.width) * 100;

    setSliderPosition(Math.min(Math.max(position, 0), 100));
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleMove);
    window.addEventListener("touchend", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="rounded-lg border bg-background/60 backdrop-blur-xl p-6 shadow-sm">
        {/* Top navigation bar */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
          <div className="text-xl font-semibold">{leftProduct.name}</div>
          <div className="text-sm text-muted-foreground">vs.</div>
          <div className="text-xl font-semibold">{rightProduct.name}</div>
        </div>

        {/* Slider container */}
        <div
          ref={containerRef}
          className="relative h-[400px] overflow-hidden rounded-xl border"
        >
          {/* Left Product */}
          <div className="absolute inset-0 h-full w-full">
            <Image
              src={leftProduct.image}
              alt={leftProduct.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Right Product */}
          <div
            className="absolute inset-0 h-full w-full"
            style={{
              clipPath: `inset(0 0 0 ${sliderPosition}%)`,
            }}
          >
            <Image
              src={rightProduct.image}
              alt={rightProduct.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Slider */}
          <div
            className="absolute inset-y-0"
            style={{ left: `${sliderPosition}%` }}
          >
            <div className="relative h-full">
              <div className="absolute inset-y-0 w-0.5 bg-white" />
              <Button
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                className={cn(
                  "absolute top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "h-12 w-12 rounded-full bg-white shadow-lg",
                  "flex items-center justify-center cursor-grab active:cursor-grabbing"
                )}
                variant="outline"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Product Labels */}
          <div className="absolute left-4 top-4 text-xl font-bold text-white shadow-sm">
            {leftProduct.name}
          </div>
          <div className="absolute right-4 top-4 text-xl font-bold text-white shadow-sm">
            {rightProduct.name}
          </div>
        </div>
      </div>
    </div>
  );
}
