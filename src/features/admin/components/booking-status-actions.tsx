"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { setBookingStatus } from "../actions";

type Props = { reference: string; status: string; checkIn: string; today: string };

/** The same permitted changes the database enforces; the buttons just avoid offering impossible ones. */
function allowedNext({ status, checkIn, today }: Pick<Props, "status" | "checkIn" | "today">) {
  if (status === "pending") return ["confirmed", "cancelled"];
  if (status === "confirmed") return checkIn <= today ? ["completed", "cancelled"] : ["cancelled"];
  return [];
}

const LABEL: Record<string, string> = {
  confirmed: "Mark confirmed",
  completed: "Mark completed",
  cancelled: "Cancel booking",
};

export function BookingStatusActions({ reference, status, checkIn, today }: Props) {
  const router = useRouter();
  const [target, setTarget] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const options = allowedNext({ status, checkIn, today });

  if (options.length === 0) {
    return <p className="text-sm text-muted-foreground">This booking is {status}; its status can no longer change.</p>;
  }

  function confirm() {
    if (!target) return;
    startTransition(async () => {
      const result = await setBookingStatus(reference, target);
      if (result.ok) {
        toast.success(result.message ?? "Status updated.");
        setTarget(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {options.map((next) => (
          <Button key={next} variant={next === "cancelled" ? "outline" : "default"} onClick={() => setTarget(next)}>
            {LABEL[next]}
          </Button>
        ))}
      </div>
      <Dialog open={target !== null} onOpenChange={(open) => !open && setTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change {reference} to {target}?
            </DialogTitle>
            <DialogDescription>
              {target === "cancelled"
                ? "The room becomes available again. Cancelled bookings cannot be reopened."
                : target === "completed"
                  ? "Completed bookings cannot be changed afterwards."
                  : "The guest will see the new status in their account."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Go back
              </Button>
            </DialogClose>
            <Button onClick={confirm} disabled={pending}>
              {pending && <Loader2 className="animate-spin" />}
              Yes, change it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
