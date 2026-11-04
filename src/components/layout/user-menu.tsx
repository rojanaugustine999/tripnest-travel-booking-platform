"use client";

import Link from "next/link";
import { LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { userNav } from "@/config/site";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/auth/actions";

/** Minimal shape the menu needs; AccountMenu maps the signed-in profile onto it. */
export type MenuUser = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  isAdmin?: boolean;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Signed-out: Log in / Sign up. Signed-in: avatar dropdown with account links. */
export function UserMenu({ user }: { user: MenuUser | null }) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <ButtonLink href="/login" variant="ghost" size="sm">
          Log in
        </ButtonLink>
        <ButtonLink href="/register" size="sm">
          Sign up
        </ButtonLink>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open account menu">
          <Avatar>
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback className="bg-navy-100 font-semibold text-navy-900">{initials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <p className="font-semibold text-foreground">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {userNav.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>
              {item.href === "/dashboard" && <LayoutDashboard />}
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
        {user.isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin">
                <ShieldCheck />
                Admin dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        {/* A real <form> posting to the signOut Server Action (works without JavaScript too). */}
        <form action={signOut}>
          <DropdownMenuItem variant="destructive" asChild>
            <button type="submit" className="w-full">
              <LogOut />
              Log out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Account section of the mobile menu sheet. */
export function MobileAccountMenu({ user }: { user: MenuUser | null }) {
  if (!user) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <ButtonLink href="/login" variant="outline">
          Log in
        </ButtonLink>
        <ButtonLink href="/register">Sign up</ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 px-1">
        <Avatar>
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
          <AvatarFallback className="bg-navy-100 font-semibold text-navy-900">{initials(user.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2">
        {[...userNav, ...(user.isAdmin ? [{ title: "Admin", href: "/admin" }] : [])].map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-navy-50"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          <LogOut />
          Log out
        </Button>
      </form>
    </div>
  );
}
