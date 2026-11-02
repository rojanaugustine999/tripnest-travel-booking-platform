import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Use light text for dark backgrounds. */
  inverted?: boolean;
};

export function Logo({ className, inverted = false }: LogoProps) {
  return (
    <Link href="/" aria-label={`${siteConfig.name} home`} className={cn("inline-flex items-center gap-2", className)}>
      <svg viewBox="0 0 32 32" aria-hidden="true" className="size-8 shrink-0">
        <rect width="32" height="32" rx="9" className="fill-navy-900" />
        {/* Nest roof / mountain mark */}
        <path
          d="M7 21 16 10l9 11"
          fill="none"
          stroke="white"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="22.5" cy="9.5" r="2.5" className="fill-coral-500" />
      </svg>
      <span
        className={cn("font-display text-xl font-extrabold tracking-tight", inverted ? "text-white" : "text-slate-900")}
      >
        Trip<span className={inverted ? "text-lagoon-300" : "text-lagoon-600"}>Nest</span>
      </span>
    </Link>
  );
}
