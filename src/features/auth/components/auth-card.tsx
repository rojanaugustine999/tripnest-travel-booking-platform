import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** Consistent card for the login, register and password pages. */
export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="rounded-3xl bg-white p-6 shadow-card-hover ring-1 ring-slate-900/5 sm:p-8">
        <h1 className="text-h3 sm:text-h2">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-7">{children}</div>
      </div>
      {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
    </div>
  );
}
