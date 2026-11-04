"use client";

import { useState, useTransition } from "react";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ActionResult } from "../actions";

/**
 * Runs a Server Action from a React Hook Form submit and maps its result back onto the form:
 * field errors appear under the matching inputs, other messages in a banner.
 */
export function useServerForm<T extends FieldValues>(setError: UseFormSetError<T>) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  function run(action: () => Promise<ActionResult | void>) {
    setResult(null);
    startTransition(async () => {
      // A successful action may redirect instead of returning a result.
      const res = await action();
      if (!res) return;
      for (const [field, message] of Object.entries(res.fieldErrors ?? {})) {
        setError(field as Path<T>, { type: "server", message });
      }
      setResult(res);
    });
  }

  return { run, pending, result };
}
