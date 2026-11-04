"use client";

import { useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { setHotelSaved } from "../actions";
import { useSavedHotels } from "./saved-hotels-provider";

type SaveHotelButtonProps = {
  hotelId: string;
  hotelName: string;
  className?: string;
  size?: "icon-sm" | "icon";
};

/**
 * Save / unsave toggle. Signed-in users' choices are stored in `saved_hotels`;
 * signed-out visitors are sent to log in and brought back to this page.
 */
export function SaveHotelButton({ hotelId, hotelName, className, size = "icon-sm" }: SaveHotelButtonProps) {
  const { signedIn, savedIds, setSaved } = useSavedHotels();
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const saved = savedIds.has(hotelId);

  function toggle() {
    if (!signedIn) {
      router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    const next = !saved;
    setSaved(hotelId, next); // show the change immediately
    startTransition(async () => {
      const result = await setHotelSaved(hotelId, next);
      if (result.ok) {
        toast(next ? `${hotelName} saved` : `${hotelName} removed from saved hotels`);
        if (pathname === "/saved-hotels") router.refresh(); // update the saved list itself
      } else {
        setSaved(hotelId, !next); // undo
        if (result.signedOut) router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
        else toast.error(result.message);
      }
    });
  }

  return (
    <Button
      variant="outline"
      size={size}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${hotelName} from saved hotels` : `Save ${hotelName}`}
      disabled={pending}
      onClick={toggle}
      className={cn("relative z-10 border-0 bg-white/95 shadow-sm backdrop-blur hover:bg-white", className)}
    >
      <Heart className={cn("transition-colors", saved ? "fill-coral-500 text-coral-500" : "text-slate-700")} />
    </Button>
  );
}
