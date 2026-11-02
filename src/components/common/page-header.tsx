import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Rendered above the title, e.g. breadcrumbs. */
  top?: ReactNode;
  /** Rendered below the description, e.g. a search bar. */
  children?: ReactNode;
  className?: string;
};

/** Navy banner used at the top of listing and content pages. */
export function PageHeader({ eyebrow, title, description, top, children, className }: PageHeaderProps) {
  return (
    <header className={cn("relative overflow-hidden bg-navy-900", className)}>
      <div aria-hidden="true" className="absolute -top-32 right-0 size-96 rounded-full bg-lagoon-500/20 blur-3xl" />
      <Container className="relative py-12 sm:py-16">
        {top}
        {eyebrow && <p className={cn("text-eyebrow text-lagoon-300 uppercase", top && "mt-6")}>{eyebrow}</p>}
        <h1 className="mt-2 text-h2 text-white sm:text-h1">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-lead text-navy-100">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </header>
  );
}
