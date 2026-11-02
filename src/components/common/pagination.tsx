import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageCount: number;
  /** Builds the link for a given page number. */
  hrefFor: (page: number) => string;
  className?: string;
};

/** Link-based pagination so every page has a shareable URL and works without JavaScript. */
export function Pagination({ page, pageCount, hrefFor, className }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination" className={cn("flex items-center justify-center gap-1.5", className)}>
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={buttonVariants({ variant: "outline", size: "sm" })} rel="prev">
          <ChevronLeft /> Previous
        </Link>
      ) : (
        <span
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}
          aria-disabled="true"
        >
          <ChevronLeft /> Previous
        </span>
      )}
      <ul className="flex items-center gap-1.5">
        {pages.map((p) => (
          <li key={p}>
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
              className={cn(buttonVariants({ variant: p === page ? "default" : "ghost", size: "icon-sm" }))}
            >
              {p}
            </Link>
          </li>
        ))}
      </ul>
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={buttonVariants({ variant: "outline", size: "sm" })} rel="next">
          Next <ChevronRight />
        </Link>
      ) : (
        <span
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-events-none opacity-50")}
          aria-disabled="true"
        >
          Next <ChevronRight />
        </span>
      )}
    </nav>
  );
}
