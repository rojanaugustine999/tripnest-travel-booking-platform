"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setHotelArchived, setHotelPublished, type AdminResult } from "../actions";

type Props = { hotelId: string; name: string; published: boolean; archived: boolean };

/** Publish / unpublish and archive / restore buttons for one hotel row. */
export function HotelRowActions({ hotelId, name, published, archived }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<AdminResult>) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Done.");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {!archived && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          aria-label={`${published ? "Unpublish" : "Publish"} ${name}`}
          onClick={() => run(() => setHotelPublished(hotelId, !published))}
        >
          {published ? "Unpublish" : "Publish"}
        </Button>
      )}
      <Button
        size="sm"
        variant="ghost"
        disabled={pending}
        aria-label={`${archived ? "Restore" : "Archive"} ${name}`}
        onClick={() => run(() => setHotelArchived(hotelId, !archived))}
      >
        {archived ? "Restore" : "Archive"}
      </Button>
    </div>
  );
}
