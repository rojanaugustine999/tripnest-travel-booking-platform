import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Crumb = { label: string; href?: string };

/** Accessible breadcrumb trail; the last item is the current page. */
export function Breadcrumbs({
  items,
  inverted = false,
  className,
}: {
  items: Crumb[];
  inverted?: boolean;
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1 text-sm",
          inverted ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn("hover:underline", inverted ? "hover:text-white" : "hover:text-slate-900")}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("font-medium", inverted ? "text-white" : "text-slate-900")}
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
