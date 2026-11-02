import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, Heart, Loader2, MapPin, Search, SearchX, Wifi, Waves, Coffee } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/empty-state";
import { RatingStars, ReviewScore } from "@/components/common/rating-stars";
import { Section } from "@/components/common/section";
import { SectionHeading } from "@/components/common/section-heading";
import { UserMenu } from "@/components/layout/user-menu";
import { formatPrice } from "@/lib/utils";
import { FormDemo, OverlayDemo } from "./_components/interactive-demos";

// Internal style guide for reviewing the design system. Not linked from navigation; hidden from search engines.
export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false, follow: false },
};

const scales = [
  { name: "navy", role: "Primary", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "lagoon", role: "Secondary (teal)", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] },
  { name: "coral", role: "Accent / call to action", steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
];

const semantic = [
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "cta", className: "bg-cta" },
  { name: "foreground", className: "bg-foreground" },
  { name: "muted", className: "bg-muted" },
  { name: "border", className: "bg-border" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "destructive", className: "bg-destructive" },
];

function Block({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <div className="border-t border-border py-10 first:border-t-0 first:pt-0">
      <h2 className="text-h3">{title}</h2>
      {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <Section>
      <SectionHeading
        as="h1"
        eyebrow="Internal"
        title="TripNest design system"
        description="Tokens and reusable components every TripNest page is built from. Use this page to review changes at different screen sizes."
      />

      <Block
        title="Colour"
        description="Navy is the primary brand colour, lagoon teal supports it, coral is reserved for the main call to action."
      >
        <div className="space-y-6">
          {scales.map((scale) => (
            <div key={scale.name}>
              <p className="mb-2 text-sm font-semibold text-slate-900">
                {scale.name} <span className="font-normal text-muted-foreground">— {scale.role}</span>
              </p>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-11">
                {scale.steps.map((step) => (
                  <div key={step}>
                    <div
                      className="h-12 rounded-lg ring-1 ring-slate-900/5"
                      style={{ background: `var(--color-${scale.name}-${step})` }}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-900">Semantic tokens</p>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-9">
              {semantic.map((token) => (
                <div key={token.name}>
                  <div className={`h-12 rounded-lg ring-1 ring-slate-900/5 ${token.className}`} />
                  <p className="mt-1 text-xs text-muted-foreground">{token.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Block>

      <Block title="Typography" description="Plus Jakarta Sans for headings, Inter for body text.">
        <div className="space-y-4">
          <p className="text-eyebrow text-lagoon-700 uppercase">Eyebrow · text-eyebrow</p>
          <p className="font-display text-h1 text-slate-900 sm:text-display">Display heading</p>
          <p className="font-display text-h1 text-slate-900">Heading 1 · text-h1</p>
          <p className="font-display text-h2 text-slate-900">Heading 2 · text-h2</p>
          <p className="font-display text-h3 text-slate-900">Heading 3 · text-h3</p>
          <p className="font-display text-h4 text-slate-900">Heading 4 · text-h4</p>
          <p className="max-w-2xl text-lead text-slate-600">
            Lead paragraph · text-lead. Discover handpicked hotels in the world&apos;s most loved destinations.
          </p>
          <p className="max-w-2xl">
            Body text · text-base. Free cancellation until 48 hours before check-in. Breakfast is served daily from 7:00
            to 10:30 in the garden restaurant.
          </p>
          <p className="text-sm text-muted-foreground">Small muted text · text-sm text-muted-foreground</p>
        </div>
      </Block>

      <Block title="Buttons" description="Use one coral call to action per view. All buttons have visible focus rings.">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="cta">
              <Search />
              Search hotels
            </Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Cancel booking</Button>
            <Button variant="link">Link button</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">
              Large <ArrowRight />
            </Button>
            <Button size="icon" variant="outline" aria-label="Save hotel">
              <Heart />
            </Button>
            <Button disabled>Disabled</Button>
            <Button disabled>
              <Loader2 className="animate-spin" />
              Processing…
            </Button>
            <ButtonLink href="/hotels" variant="outline">
              Link styled as button
            </ButtonLink>
          </div>
        </div>
      </Block>

      <Block
        title="Form controls"
        description="Labels are always visible; hints and errors are linked to the field for screen readers."
      >
        <FormDemo />
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="offer">20% off</Badge>
          <Badge variant="soft">Free cancellation</Badge>
          <Badge variant="success">Confirmed</Badge>
          <Badge variant="warning">Pending</Badge>
          <Badge variant="destructive">Cancelled</Badge>
          <Badge variant="muted">Demo booking</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Block>

      <Block title="Cards & ratings" description="Preview of the card styling that Phase 3 hotel cards will build on.">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="gap-0 py-0 transition-shadow duration-300 hover:shadow-card-hover">
            <div className="relative h-44 bg-gradient-to-br from-lagoon-400 to-navy-700">
              <Badge variant="offer" className="absolute top-3 left-3">
                Special offer
              </Badge>
              <Button
                size="icon-sm"
                variant="outline"
                aria-label="Save hotel"
                className="absolute top-3 right-3 border-0 bg-white/90"
              >
                <Heart />
              </Button>
            </div>
            <CardHeader className="pt-5">
              <RatingStars rating={4} />
              <CardTitle>Lagoon Bay Resort</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden="true" /> Goa, India
              </CardDescription>
            </CardHeader>
            <CardContent className="mt-3 space-y-3">
              <ReviewScore score={8.7} reviewCount={1204} />
              <ul className="flex gap-3 text-muted-foreground" aria-label="Amenities">
                <li className="flex items-center gap-1 text-xs">
                  <Wifi className="size-3.5" aria-hidden="true" /> Wi-Fi
                </li>
                <li className="flex items-center gap-1 text-xs">
                  <Waves className="size-3.5" aria-hidden="true" /> Pool
                </li>
                <li className="flex items-center gap-1 text-xs">
                  <Coffee className="size-3.5" aria-hidden="true" /> Breakfast
                </li>
              </ul>
            </CardContent>
            <CardFooter className="mt-5 justify-between">
              <p>
                <span className="font-display text-h4 text-slate-900">{formatPrice(6499)}</span>
                <span className="text-xs text-muted-foreground"> / night</span>
              </p>
              <Button size="sm">View details</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plain card</CardTitle>
              <CardDescription>Header, content and footer slots.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">Cards use a soft shadow and a subtle ring instead of heavy borders.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loading skeleton</CardTitle>
              <CardDescription>Shown while data loads.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </Block>

      <Block
        title="Overlays & feedback"
        description="Dialog, dropdown, sheet and tooltip are keyboard accessible: Tab to focus, Enter/Space to open, Escape to close."
      >
        <OverlayDemo />
      </Block>

      <Block title="Empty state">
        <EmptyState
          icon={SearchX}
          title="No hotels match your filters"
          description="Try widening your price range or removing some amenities."
          action={<Button variant="outline">Clear filters</Button>}
        />
      </Block>

      <Block title="Navigation" description="Account menu in its signed-out and signed-in (demo) states.">
        <div className="flex flex-wrap items-center gap-8">
          <UserMenu user={null} />
          <Separator orientation="vertical" className="h-8" />
          <UserMenu user={{ name: "Priya Sharma", email: "priya@example.com", isAdmin: true }} />
        </div>
      </Block>
    </Section>
  );
}
