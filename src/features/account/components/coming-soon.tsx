import type { LucideIcon } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { requireUser } from "@/lib/auth/session";

type ComingSoonProps = {
  path: string;
  icon: LucideIcon;
  title: string;
  description: string;
};

/** Protected placeholder: proves the page is account-only now; its real content arrives in Phase 8. */
export async function ComingSoon({ path, icon, title, description }: ComingSoonProps) {
  await requireUser(path);
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={<ButtonLink href="/hotels">Browse hotels</ButtonLink>}
    />
  );
}
