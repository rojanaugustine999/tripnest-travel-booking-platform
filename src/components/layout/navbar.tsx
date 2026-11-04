"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type NavbarProps = {
  /** Account menu for wide screens, rendered on the server (see AccountMenu). */
  account: ReactNode;
  /** Account section for the mobile menu sheet. */
  mobileAccount: ReactNode;
};

export function Navbar({ account, mobileAccount }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet when any link or button inside the account section is used.
  const closeOnAction = (event: MouseEvent) => {
    if ((event.target as HTMLElement).closest("a, button")) setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-white/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive(pathname, item.href)
                      ? "bg-navy-50 text-navy-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden lg:block">{account}</div>

        {/* Mobile: Radix Sheet gives focus trapping, Escape to close and screen-reader labelling. */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2 lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85%] max-w-sm gap-0 p-0">
            <SheetHeader className="border-b border-border px-6 py-4">
              <Logo />
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SheetDescription className="sr-only">Site navigation</SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
              <ul className="flex flex-col gap-1">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(pathname, item.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-medium",
                        isActive(pathname, item.href) ? "bg-navy-50 text-navy-900" : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="border-t border-border p-4" onClickCapture={closeOnAction}>
              {mobileAccount}
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
