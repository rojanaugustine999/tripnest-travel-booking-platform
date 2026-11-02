"use client";

import { useCallback, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseHotelSearchParams, toHotelSearchQuery, type HotelSearchParams } from "../lib/search-params";

/**
 * Reads the current hotel search from the URL and updates it.
 * Every filter change resets to page 1 and replaces the history entry (no back-button spam).
 */
export function useHotelSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const params = useMemo(() => parseHotelSearchParams(searchParams), [searchParams]);

  const update = useCallback(
    (changes: Partial<HotelSearchParams>) => {
      const next = { ...params, page: 1, ...changes };
      startTransition(() => {
        router.replace(`${pathname}${toHotelSearchQuery(next)}`, { scroll: false });
      });
    },
    [params, pathname, router],
  );

  return { params, update, isPending };
}

/** Adds the value if missing, removes it if present. */
export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}
