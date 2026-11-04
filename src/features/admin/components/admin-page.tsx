import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type AdminPageProps = {
  title: string;
  description?: string;
  /** Buttons shown next to the title. */
  actions?: ReactNode;
  /** Async server content that checks the admin role; it must stay inside the Suspense boundary. */
  children: ReactNode;
};

/** Heading plus a loading skeleton for an admin page. */
export function AdminPage({ title, description, actions, children }: AdminPageProps) {
  return (
    <div>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-h2">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </div>
      <Suspense
        fallback={
          <div className="space-y-4" aria-busy="true">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}
