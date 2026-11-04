import { getCurrentProfile } from "@/lib/auth/session";
import { MobileAccountMenu, UserMenu, type MenuUser } from "./user-menu";

/**
 * Reads the signed-in user on the server and renders the matching account UI.
 * Rendered inside <Suspense> in the root layout, so the rest of every page is still prerendered
 * and only this small part waits for the session.
 */
export async function AccountMenu({ variant }: { variant: "desktop" | "mobile" }) {
  const profile = await getCurrentProfile();
  const user: MenuUser | null = profile
    ? {
        name: profile.full_name || profile.email.split("@")[0],
        email: profile.email,
        avatarUrl: profile.avatar_url,
        isAdmin: profile.role === "admin",
      }
    : null;

  return variant === "desktop" ? <UserMenu user={user} /> : <MobileAccountMenu user={user} />;
}
