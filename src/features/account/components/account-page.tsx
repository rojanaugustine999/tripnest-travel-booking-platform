import { Suspense, type ReactNode } from "react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/common/page-header";

type AccountPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  /** Server content that checks the session — it must stay inside the Suspense boundary. */
  children: ReactNode;
};

/** Shared frame for signed-in pages. The header is prerendered; the protected part streams in. */
export function AccountPage({ eyebrow, title, description, children }: AccountPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <Container className="py-10 lg:py-12">
        <Suspense
          fallback={
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-40 rounded-2xl" />
              ))}
            </div>
          }
        >
          {children}
        </Suspense>
      </Container>
    </>
  );
}
