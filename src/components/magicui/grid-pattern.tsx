"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  squares?: [number, number][];
  className?: string;
}

export default function GridPattern({
  width = 40,
  height = 40,
  squares = [[1, 1]],
  className,
  ...props
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x="50%"
          y="50%"
          patternTransform="translate(-25 -25)"
        >
          {squares.map(([x, y], index) => (
            <rect
              key={`rect-${index}`}
              width="1"
              height="1"
              x={x}
              y={y}
              className="fill-neutral-200 dark:fill-neutral-800"
            />
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
