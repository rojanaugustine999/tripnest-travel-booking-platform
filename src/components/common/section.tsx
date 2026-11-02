import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Container } from "@/components/ui/container";

type SectionProps = ComponentProps<"section"> & {
  /** Light grey band to separate consecutive sections. */
  muted?: boolean;
  containerClassName?: string;
};

/** Page section with consistent vertical rhythm and a centred container. */
export function Section({ muted = false, className, containerClassName, children, ...props }: SectionProps) {
  return (
    <section className={cn("py-16 sm:py-20", muted && "bg-slate-50", className)} {...props}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  );
}
