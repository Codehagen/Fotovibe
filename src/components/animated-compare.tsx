"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export const AnimatedGrid = ({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "alternate";
}) => {
  const gridSize = variant === "default" ? 64 : 48;
  const baseDelay = variant === "default" ? 0.05 : 0.03;

  return (
    <div className={`grid grid-cols-8 gap-1 absolute ${className}`}>
      {Array.from({ length: gridSize }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * baseDelay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export const AnimatedImage = ({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <div className="relative">
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute inset-0 -m-6 bg-gradient-to-r from-purple-100 to-green-100 rounded-full opacity-50 blur-xl"
      />
      <AnimatedGrid className="-left-24 -top-24" variant="alternate" />
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-5, 5, -5] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <Image
          src={src}
          alt={alt}
          width={140}
          height={140}
          className={`rounded-xl shadow-lg ${className}`}
        />
      </motion.div>
      <AnimatedGrid className="-right-24 -bottom-24" />
    </div>
  );
};
