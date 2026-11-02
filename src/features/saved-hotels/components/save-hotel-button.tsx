"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type SaveHotelButtonProps = {
  hotelName: string;
  className?: string;
  size?: "icon-sm" | "icon";
};

/**
 * Save / unsave toggle. Phase 3: remembered only for the current page visit (demo).
 * Phase 6: persisted to the `saved_hotels` table for signed-in users.
 */
export function SaveHotelButton({ hotelName, className, size = "icon-sm" }: SaveHotelButtonProps) {
  const [saved, setSaved] = useState(false);

  function toggle() {
    setSaved((value) => !value);
    if (saved) {
      toast(`${hotelName} removed from saved hotels`);
    } else {
      toast.success(`${hotelName} saved`, {
        description: "Demo only — saved hotels will sync to your account once sign-in is available.",
      });
    }
  }

  return (
    <Button
      variant="outline"
      size={size}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${hotelName} from saved hotels` : `Save ${hotelName}`}
      onClick={toggle}
      className={cn("relative z-10 border-0 bg-white/95 shadow-sm backdrop-blur hover:bg-white", className)}
    >
      <Heart className={cn("transition-colors", saved ? "fill-coral-500 text-coral-500" : "text-slate-700")} />
    </Button>
  );
}
