import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminNav } from "@/features/admin/components/admin-nav";

/**
 * Admin frame. A layout is not a security check (it does not re-run on every navigation), so each
 * admin page and Server Action calls requireAdmin() / checks the role itself.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Container className="py-8 lg:py-10">
      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <p className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold tracking-wider text-lagoon-700 uppercase">
            <ShieldCheck className="size-4" aria-hidden="true" />
            Administration
          </p>
          <Suspense fallback={<Skeleton className="h-12 w-full rounded-xl lg:h-48" />}>
            <AdminNav />
          </Suspense>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
