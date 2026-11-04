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
import { setUserRole } from "../actions";

type Props = { userId: string; email: string; role: "user" | "admin"; isSelf: boolean };

/** Promote or demote another user. Your own role cannot be changed (so an admin cannot lock themselves out). */
export function UserRoleControl({ userId, email, role, isSelf }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const next = role === "admin" ? "user" : "admin";

  if (isSelf) return <span className="text-xs text-muted-foreground">This is you</span>;

  function confirm() {
    startTransition(async () => {
      const result = await setUserRole(userId, next);
      if (result.ok) {
        toast.success(result.message ?? "Role changed.");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={`Make ${email} ${next === "admin" ? "an administrator" : "a regular user"}`}
      >
        {next === "admin" ? "Make admin" : "Remove admin"}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {next === "admin" ? "Make this user an administrator?" : "Remove administrator rights?"}
            </DialogTitle>
            <DialogDescription>
              {email}{" "}
              {next === "admin"
                ? "will be able to manage hotels, rooms, bookings and other users."
                : "will lose access to the admin area."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Go back
              </Button>
            </DialogClose>
            <Button onClick={confirm} disabled={pending} variant={next === "admin" ? "default" : "destructive"}>
              {pending && <Loader2 className="animate-spin" />}
              Yes, {next === "admin" ? "make admin" : "remove admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
