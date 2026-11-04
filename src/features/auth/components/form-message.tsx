import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Success or error banner for a whole form, announced to screen readers. */
export function FormMessage({ tone, children }: { tone: "success" | "error"; children: React.ReactNode }) {
  const Icon = tone === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2.5 rounded-xl px-4 py-3 text-sm",
        tone === "success" ? "bg-green-50 text-green-900" : "bg-red-50 text-red-900",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
