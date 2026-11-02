import type { FooterLinkGroup, NavItem } from "@/types";

export const siteConfig = {
  name: "TripNest",
  tagline: "Your nest for unforgettable journeys",
  description:
    "Discover handpicked destinations and tour packages, book in minutes, and manage every trip in one place with TripNest.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  contact: {
    email: "hello@tripnest.example",
    phone: "+91 00000 00000",
  },
} as const;

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Destinations", href: "/destinations" },
  { title: "Packages", href: "/packages" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const footerNav: FooterLinkGroup[] = [
  {
    title: "Explore",
    links: [
      { title: "Destinations", href: "/destinations" },
      { title: "Tour Packages", href: "/packages" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Contact", href: "/contact" },
      { title: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { title: "Terms of Service", href: "/terms" },
      { title: "Privacy Policy", href: "/privacy" },
    ],
  },
];
