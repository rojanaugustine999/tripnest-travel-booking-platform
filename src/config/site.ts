import type { FooterLinkGroup, NavItem } from "@/types";

export const siteConfig = {
  name: "TripNest",
  tagline: "Find your perfect stay",
  description:
    "Discover destinations, compare hotels and rooms, and complete a demo booking in minutes. Manage every stay from your TripNest dashboard.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    email: "hello@tripnest.example",
    phone: "+91 00000 00000",
  },
} as const;

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Destinations", href: "/destinations" },
  { title: "Hotels", href: "/hotels" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

/** Links shown in the signed-in user menu (wired to real auth in Phase 5). */
export const userNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "My bookings", href: "/bookings" },
  { title: "Saved hotels", href: "/saved-hotels" },
  { title: "Profile", href: "/profile" },
];

export const footerNav: FooterLinkGroup[] = [
  {
    title: "Explore",
    links: [
      { title: "Destinations", href: "/destinations" },
      { title: "Hotels", href: "/hotels" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { title: "Log in", href: "/login" },
      { title: "Create account", href: "/register" },
      { title: "My bookings", href: "/bookings" },
    ],
  },
];
