"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type SavedHotelsState = {
  /** `null` until the browser has checked; then true/false. */
  signedIn: boolean | null;
  savedIds: ReadonlySet<string>;
  setSaved: (hotelId: string, saved: boolean) => void;
};

const SavedHotelsContext = createContext<SavedHotelsState>({
  signedIn: null,
  savedIds: new Set(),
  setSaved: () => {},
});

export const useSavedHotels = () => useContext(SavedHotelsContext);

/**
 * Loads the signed-in user's saved hotel ids once in the browser (Row Level Security returns only their own rows),
 * so hotel pages stay cacheable and shared between visitors while the hearts still show the right state.
 */
export function SavedHotelsProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setSignedIn(false);
        setSavedIds(new Set());
        return;
      }
      const { data: rows } = await supabase.from("saved_hotels").select("hotel_id");
      setSavedIds(new Set((rows ?? []).map((r) => r.hotel_id)));
      setSignedIn(true);
    }

    void load();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") void load();
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<SavedHotelsState>(
    () => ({
      signedIn,
      savedIds,
      setSaved: (hotelId, saved) =>
        setSavedIds((current) => {
          const next = new Set(current);
          if (saved) next.add(hotelId);
          else next.delete(hotelId);
          return next;
        }),
    }),
    [signedIn, savedIds],
  );

  return <SavedHotelsContext.Provider value={value}>{children}</SavedHotelsContext.Provider>;
}
