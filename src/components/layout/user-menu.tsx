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

/** Minimal shape the menu needs; Phase 5 maps the Supabase session + profile onto it. */
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
        {/* Logout action is connected to Supabase Auth in Phase 5. */}
        <DropdownMenuItem variant="destructive">
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
