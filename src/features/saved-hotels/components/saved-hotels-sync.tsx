"use client";

import { useEffect } from "react";
import { useSavedHotels } from "./saved-hotels-provider";

/** Renders nothing. Tells the saved-hotels provider whether the server sees a signed-in user. */
export function SavedHotelsSync({ signedIn }: { signedIn: boolean }) {
  const { syncAuth } = useSavedHotels();
  useEffect(() => syncAuth(signedIn), [signedIn, syncAuth]);
  return null;
}
