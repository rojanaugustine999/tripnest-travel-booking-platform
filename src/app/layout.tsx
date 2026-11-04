import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { siteConfig } from "@/config/site";
import { Suspense } from "react";
import { AccountMenu } from "@/components/layout/account-menu";
import { Navbar } from "@/components/layout/navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SavedHotelsProvider } from "@/features/saved-hotels/components/saved-hotels-provider";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#172645",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={cn("h-full", inter.variable, jakarta.variable)}>
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          {/* The provider wraps the navbar too: the account menu tells it who is signed in. */}
          <SavedHotelsProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:shadow-card"
            >
              Skip to content
            </a>
            {/* The navbar reads the current URL, which is unknown while prerendering dynamic routes such as /confirmation/[reference]. */}
            <Suspense fallback={<div className="h-[65px] border-b border-border/70 bg-white" />}>
              <Navbar
                account={
                  <Suspense fallback={<Skeleton className="h-9 w-40 rounded-full" />}>
                    <AccountMenu variant="desktop" />
                  </Suspense>
                }
                mobileAccount={
                  <Suspense fallback={<Skeleton className="h-11 w-full rounded-full" />}>
                    <AccountMenu variant="mobile" />
                  </Suspense>
                }
              />
            </Suspense>
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
            <Toaster position="top-center" />
          </SavedHotelsProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
