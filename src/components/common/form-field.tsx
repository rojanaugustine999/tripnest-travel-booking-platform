import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

type FieldA11y = {
  id: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  /** Render prop receives the props that link the control to its label, hint and error. */
  children: (field: FieldA11y) => ReactNode;
};

/**
 * Accessible field wrapper: visible label, optional hint, error message announced to screen readers,
 * and `aria-describedby` / `aria-invalid` wired onto the control.
 */
export function FormField({ id, label, hint, error, required, className, children }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-slate-800">
        {label}
        {required && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
