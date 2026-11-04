import { Badge } from "@/components/ui/badge";
import type { Enums } from "@/types/database";

const STATUS: Record<Enums<"booking_status">, { label: string; variant: "success" | "muted" | "soft" | "outline" }> = {
  confirmed: { label: "Confirmed", variant: "success" },
  pending: { label: "Pending", variant: "soft" },
  completed: { label: "Completed", variant: "muted" },
  cancelled: { label: "Cancelled", variant: "outline" },
};

export function StatusBadge({ status }: { status: Enums<"booking_status"> }) {
  const { label, variant } = STATUS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
