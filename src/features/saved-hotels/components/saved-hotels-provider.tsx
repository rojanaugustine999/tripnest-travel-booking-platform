"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { getSavedHotelIds } from "../actions";

type SavedHotelsState = {
  /** `null` until the navbar has reported who is signed in; then true/false. */
  signedIn: boolean | null;
  savedIds: ReadonlySet<string>;
  setSaved: (hotelId: string, saved: boolean) => void;
  /** Called by <SavedHotelsSync> (rendered by the account menu) whenever the signed-in state is known. */
  syncAuth: (signedIn: boolean) => void;
};

const SavedHotelsContext = createContext<SavedHotelsState>({
  signedIn: null,
  savedIds: new Set(),
  setSaved: () => {},
  syncAuth: () => {},
});

export const useSavedHotels = () => useContext(SavedHotelsContext);

/**
 * Holds the signed-in user's saved hotel ids so every heart shows the right state while public pages stay
 * cached and shared. The ids come from a Server Action (no Supabase code is shipped to visitors who are
 * signed out), and the account menu tells this provider when someone signs in or out.
 */
export function SavedHotelsProvider({ children }: { children: ReactNode }) {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(new Set());
  const lastSync = useRef<boolean | null>(null);

  const syncAuth = useCallback((next: boolean) => {
    // The account menu renders twice (desktop and mobile) and again after every auth change: only act on a real change.
    if (lastSync.current === next) return;
    lastSync.current = next;
    setSignedIn(next);
    if (!next) {
      setSavedIds(new Set());
      return;
    }
    void getSavedHotelIds().then((ids) => {
      if (lastSync.current === true) setSavedIds(new Set(ids));
    });
  }, []);

  const value = useMemo<SavedHotelsState>(
    () => ({
      signedIn,
      savedIds,
      syncAuth,
      setSaved: (hotelId, saved) =>
        setSavedIds((current) => {
          const next = new Set(current);
          if (saved) next.add(hotelId);
          else next.delete(hotelId);
          return next;
        }),
    }),
    [signedIn, savedIds, syncAuth],
  );

  return <SavedHotelsContext.Provider value={value}>{children}</SavedHotelsContext.Provider>;
}
