import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
};

/** Icon + title + text card used for "why choose us" style content. */
export function FeatureCard({ icon: Icon, title, description, className }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-7 shadow-card ring-1 ring-slate-900/5 transition-shadow duration-300 hover:shadow-card-hover",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-lagoon-50 text-lagoon-700">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-h4">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
