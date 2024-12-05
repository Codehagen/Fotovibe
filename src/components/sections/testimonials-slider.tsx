"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  logo: string;
  quote: string;
  author: {
    name: string;
    title: string;
    image: string;
  };
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    logo: "https://avatar.vercel.sh/fotovibe",
    quote:
      "FotoVibe has transformed how we manage and share our photography. The platform's intuitive interface and powerful features have made our workflow significantly more efficient.",
    author: {
      name: "Maria Nordmann",
      title: "Professional Photographer",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    },
  },
  {
    id: 2,
    logo: "https://avatar.vercel.sh/studio",
    quote:
      "As a photography studio, we needed a solution that could handle our large volume of photos while maintaining quality and organization. FotoVibe delivered exactly what we needed.",
    author: {
      name: "Anders Johnson",
      title: "Studio Owner",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    },
  },
  {
    id: 3,
    logo: "https://avatar.vercel.sh/wedding",
    quote:
      "The ability to easily share and organize wedding photos has made our clients incredibly happy. FotoVibe has become an essential part of our photography business.",
    author: {
      name: "Sophie Williams",
      title: "Wedding Photographer",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
    },
  },
];

export function TestimonialSlider() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const onInit = useCallback((emblaApi: any) => {
    setScrollSnaps(emblaApi.scrollSnapList());
  }, []);

  const onSelect = useCallback((emblaApi: any) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onInit(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className="mx-auto max-w-4xl px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex-[0_0_100%] min-w-0">
              <div className="grid items-center justify-between rounded-xl border bg-background/60 backdrop-blur-xl md:grid-cols-2">
                <div className="order-2 flex flex-col gap-y-5 p-7 md:order-1 lg:p-10">
                  <Image
                    src={testimonial.logo}
                    alt="Company logo"
                    width={80}
                    height={32}
                    className="mb-4 rounded-lg"
                  />
                  <div className="space-y-2">
                    <blockquote className="text-xl font-medium tracking-tight text-gray-900">
                      {testimonial.quote}
                    </blockquote>
                  </div>
                </div>
                <div className="relative order-1 mx-auto h-[300px] w-full overflow-hidden rounded-t-xl md:order-2 md:rounded-r-xl md:rounded-tl-none">
                  <Image
                    src={testimonial.author.image}
                    alt={testimonial.author.name}
                    fill
                    className="object-cover object-center"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm rounded-xl p-4">
                    <div className="font-semibold text-lg">
                      {testimonial.author.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.author.title}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-4">
        {scrollSnaps.map((_, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className="w-2 h-2 rounded-full p-0"
            onClick={() => scrollTo(index)}
          >
            <div
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === selectedIndex ? "bg-primary" : "bg-gray-300"
              )}
            />
            <span className="sr-only">Go to slide {index + 1}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
