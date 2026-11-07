"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export type HeroSlide = { src: string; label: string };

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** True when the visitor's device asks for less motion. Renders as false on the server, so there is no mismatch. */
function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED_MOTION);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

type HeroSlideshowProps = {
  slides: readonly HeroSlide[];
  /** Milliseconds each photo stays on screen. */
  interval?: number;
};

/**
 * Full-bleed background slideshow for the hero: photos cross-fade automatically, and visitors can go to the
 * previous or next photo, jump to one with the dots, or pause and resume. It pauses by itself while the pointer or
 * keyboard focus is on the controls, and never starts moving for people who ask their device for reduced motion.
 * Put it inside a `relative isolate overflow-hidden` section.
 */
export function HeroSlideshow({ slides, interval = 6000 }: HeroSlideshowProps) {
  const [index, setIndex] = useState(0);
  // Photos already shown. Only these and the next one are loaded, so the first photo is not slowed by the others.
  const [seen, setSeen] = useState<number[]>([0]);
  // null = the visitor has not pressed pause/play yet. Then we follow their device: moving, unless "reduce motion".
  const [chosen, setChosen] = useState<boolean | null>(null);
  const [holding, setHolding] = useState(false);
  const count = slides.length;
  const reducedMotion = usePrefersReducedMotion();
  const playing = chosen ?? !reducedMotion;

  const show = (next: number) => {
    setIndex(next);
    setSeen((list) => (list.includes(next) ? list : [...list, next]));
  };

  useEffect(() => {
    if (!playing || holding || count < 2) return;
    const timer = window.setInterval(() => show((index + 1) % count), interval);
    return () => window.clearInterval(timer);
  }, [playing, holding, count, interval, index]);

  const go = (next: number) => show((next + count) % count);
  const buttonClass =
    "flex size-9 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none";

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        {slides.map((slide, i) =>
          seen.includes(i) || i === (index + 1) % count ? (
            <Image
              key={slide.src}
              src={slide.src}
              alt=""
              fill
              preload={i === 0}
              quality={60}
              sizes="100vw"
              className={cn(
                "object-cover transition-opacity duration-1000 ease-in-out motion-reduce:transition-none",
                i === index ? "opacity-100" : "opacity-0",
              )}
            />
          ) : null,
        )}
      </div>

      {count > 1 && (
        <div
          role="group"
          aria-roledescription="carousel"
          aria-label="Hero photos"
          onMouseEnter={() => setHolding(true)}
          onMouseLeave={() => setHolding(false)}
          onFocus={() => setHolding(true)}
          onBlur={() => setHolding(false)}
          className="absolute right-4 bottom-4 z-10 flex items-center gap-1 rounded-full bg-navy-950/55 px-1.5 py-1 text-white shadow-lg backdrop-blur-md sm:right-6 sm:bottom-6"
        >
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={buttonClass}>
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setChosen(!playing)}
            aria-label={playing ? "Pause slideshow" : "Play slideshow"}
            className={buttonClass}
          >
            {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          </button>

          <div className="flex items-center px-1">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1} of ${count}: ${slide.label}`}
                aria-current={i === index ? "true" : undefined}
                className="group flex h-9 items-center px-1 focus-visible:outline-none"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-all duration-300 group-focus-visible:ring-2 group-focus-visible:ring-white",
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50 group-hover:bg-white/80",
                  )}
                />
              </button>
            ))}
          </div>

          <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={buttonClass}>
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>

          {/* Announced only when the visitor changes photos while the slideshow is paused. */}
          <p className="sr-only" aria-live={playing ? "off" : "polite"}>
            Photo {index + 1} of {count}: {slides[index].label}
          </p>
        </div>
      )}
    </>
  );
}
