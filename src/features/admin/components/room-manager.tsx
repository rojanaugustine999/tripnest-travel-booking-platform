"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/common/form-field";
import { FormMessage } from "@/features/auth/components/form-message";
import { deleteRoom, saveRoom, setRoomActive, type AdminResult } from "../actions";
import { roomFormSchema, type RoomFormInput } from "../validation";

export type AdminRoom = RoomFormInput & { id: string };

type Props = { hotelId: string; hotelName: string; rooms: AdminRoom[] };

const blankRoom = (hotelId: string): RoomFormInput => ({
  hotelId,
  name: "",
  description: "",
  pricePerNight: 5000,
  maxGuests: 2,
  bedInfo: "",
  sizeSqm: 25,
  amenities: "",
  totalUnits: 5,
  blockedUnits: 0,
  imageUrl: "",
  isActive: true,
});

function RoomForm({ defaults, onDone }: { defaults: RoomFormInput; onDone: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [banner, setBanner] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RoomFormInput>({ resolver: zodResolver(roomFormSchema), defaultValues: defaults });

  function submit(values: RoomFormInput) {
    setBanner(null);
    startTransition(async () => {
      const result = await saveRoom(values);
      if (result.ok) {
        toast.success(result.message ?? "Room saved.");
        onDone();
        router.refresh();
        return;
      }
      for (const [field, message] of Object.entries(result.fieldErrors ?? {})) {
        setError(field as Path<RoomFormInput>, { type: "server", message });
      }
      setBanner(result.message);
    });
  }

  const num = { valueAsNumber: true } as const;
  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {banner && <FormMessage tone="error">{banner}</FormMessage>}
      <FormField id="rm-name" label="Room name" required error={errors.name?.message}>
        {(f) => <Input {...f} {...register("name")} />}
      </FormField>
      <FormField id="rm-desc" label="Description" required error={errors.description?.message}>
        {(f) => <Textarea {...f} rows={3} {...register("description")} />}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="rm-price" label="Price per night (₹)" required error={errors.pricePerNight?.message}>
          {(f) => <Input {...f} type="number" min={100} step={50} {...register("pricePerNight", num)} />}
        </FormField>
        <FormField id="rm-guests" label="Sleeps up to" required error={errors.maxGuests?.message}>
          {(f) => <Input {...f} type="number" min={1} max={16} {...register("maxGuests", num)} />}
        </FormField>
        <FormField id="rm-bed" label="Beds" required hint="e.g. 1 king bed" error={errors.bedInfo?.message}>
          {(f) => <Input {...f} {...register("bedInfo")} />}
        </FormField>
        <FormField id="rm-size" label="Size (m²)" required error={errors.sizeSqm?.message}>
          {(f) => <Input {...f} type="number" min={5} {...register("sizeSqm", num)} />}
        </FormField>
        <FormField id="rm-total" label="Rooms of this type" required error={errors.totalUnits?.message}>
          {(f) => <Input {...f} type="number" min={1} {...register("totalUnits", num)} />}
        </FormField>
        <FormField
          id="rm-blocked"
          label="Blocked rooms"
          hint="Out of service (maintenance, owner use)."
          error={errors.blockedUnits?.message}
        >
          {(f) => <Input {...f} type="number" min={0} {...register("blockedUnits", num)} />}
        </FormField>
      </div>
      <FormField id="rm-amenities" label="Room amenities" hint="One per line." error={errors.amenities?.message}>
        {(f) => <Textarea {...f} rows={3} {...register("amenities")} />}
      </FormField>
      <FormField
        id="rm-image"
        label="Image link (optional)"
        hint="Full https:// link."
        error={errors.imageUrl?.message}
      >
        {(f) => <Input {...f} inputMode="url" {...register("imageUrl")} />}
      </FormField>
      <label className="flex items-center gap-2.5 text-sm text-slate-800">
        <input type="checkbox" className="size-4 rounded accent-navy-900" {...register("isActive")} />
        Active (guests can book this room)
      </label>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" disabled={pending}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          Save room
        </Button>
      </DialogFooter>
    </form>
  );
}

export function RoomManager({ hotelId, hotelName, rooms }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<RoomFormInput | null>(null);
  const [toDelete, setToDelete] = useState<AdminRoom | null>(null);
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<AdminResult>, after?: () => void) {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message ?? "Done.");
        after?.();
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setEditing(blankRoom(hotelId))}>
          <Plus />
          Add room type
        </Button>
      </div>

      {rooms.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          {hotelName} has no rooms yet. A hotel needs at least one active room to appear in search.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-slate-900/5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <caption className="sr-only">Room types of {hotelName}</caption>
            <thead className="border-b border-border text-xs text-muted-foreground uppercase">
              <tr>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Room
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Price / night
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Rooms
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Status
                </th>
                <th scope="col" className="px-5 py-3 font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Sleeps {room.maxGuests} · {room.bedInfo} · {room.sizeSqm} m²
                    </p>
                  </td>
                  <td className="px-5 py-4">{formatPrice(room.pricePerNight)}</td>
                  <td className="px-5 py-4">
                    {room.totalUnits - room.blockedUnits} available
                    <span className="block text-xs text-muted-foreground">
                      {room.totalUnits} total{room.blockedUnits ? `, ${room.blockedUnits} blocked` : ""}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {room.isActive ? <Badge variant="success">Active</Badge> : <Badge variant="muted">Hidden</Badge>}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditing(room)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        aria-label={`${room.isActive ? "Hide" : "Show"} ${room.name}`}
                        onClick={() => run(() => setRoomActive(room.id, !room.isActive))}
                      >
                        {room.isActive ? "Hide" : "Show"}
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setToDelete(room)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit room type" : "Add room type"}</DialogTitle>
            <DialogDescription>Prices are per room per night. Guests only see rooms that are active.</DialogDescription>
          </DialogHeader>
          {editing && <RoomForm key={editing.id ?? "new"} defaults={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={toDelete !== null} onOpenChange={(open) => !open && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {toDelete?.name}?</DialogTitle>
            <DialogDescription>
              This cannot be undone. A room that already has bookings cannot be deleted; hide it instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Keep room
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                toDelete &&
                run(
                  () => deleteRoom(toDelete.id),
                  () => setToDelete(null),
                )
              }
            >
              {pending && <Loader2 className="animate-spin" />}
              Delete room
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
