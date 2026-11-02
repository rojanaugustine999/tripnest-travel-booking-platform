"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { HotelImage } from "@/types/domain";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Mosaic of hotel photos with a keyboard-friendly lightbox. */
export function HotelGallery({ images, hotelName }: { images: HotelImage[]; hotelName: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const preview = images.slice(0, 4);
  const count = images.length;

  const go = (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + count) % count));

  return (
    <>
      <div className="grid h-[280px] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-2xl sm:h-[420px]">
        {preview.map((image, i) => (
          <button
            key={image.url + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={`Open photo ${i + 1} of ${count}: ${image.alt}`}
            className={cn(
              "group relative overflow-hidden bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-inset",
              i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block",
              i === 1 && "sm:col-span-2",
              preview.length === 2 && i === 1 && "sm:row-span-2",
              preview.length === 3 && i === 1 && "sm:col-span-2",
              preview.length === 3 && i === 2 && "sm:col-span-2",
            )}
          >
            <Image
              src={image.url}
              alt={image.alt}
              fill
              preload={i === 0}
              sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "25vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpenIndex(0)}>
        <Images />
        View all {count} photos
      </Button>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent
          className="max-w-4xl gap-3 p-3 sm:max-w-4xl"
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") go(1);
            if (e.key === "ArrowLeft") go(-1);
          }}
        >
          <DialogTitle className="sr-only">{hotelName} photos</DialogTitle>
          <DialogDescription className="sr-only">Use the left and right arrow keys to browse photos.</DialogDescription>
          {openIndex !== null && (
            <>
              <div className="relative aspect-[3/2] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={images[openIndex].url}
                  alt={images[openIndex].alt}
                  fill
                  sizes="(min-width: 896px) 896px, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="flex items-center justify-between gap-3 px-1">
                <Button variant="outline" size="icon-sm" onClick={() => go(-1)} aria-label="Previous photo">
                  <ChevronLeft />
                </Button>
                <p className="text-center text-sm text-muted-foreground" aria-live="polite">
                  {openIndex + 1} / {count} · {images[openIndex].alt}
                </p>
                <Button variant="outline" size="icon-sm" onClick={() => go(1)} aria-label="Next photo">
                  <ChevronRight />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
