import { BadgeCheck, Building2, MapPinned, ReceiptText } from "lucide-react";
import { Container } from "@/components/ui/container";
import { GithubIcon } from "@/components/ui/github-icon";
import { siteConfig } from "@/config/site";

/** A short row of facts under the hero, plus the demo notice. Numbers come from the live catalogue. */
export function TrustStrip({ hotelCount, destinationCount }: { hotelCount: number; destinationCount: number }) {
  const items = [
    { icon: Building2, title: `${hotelCount} hand-picked hotels`, text: "Hotels, resorts and villas" },
    { icon: MapPinned, title: `${destinationCount} destinations`, text: "India and around the world" },
    { icon: ReceiptText, title: "Honest pricing", text: "Offers and 12% GST shown up front" },
    { icon: BadgeCheck, title: "Clear cancellation", text: "Terms on every hotel page" },
  ];

  return (
    <section aria-label="Why book with TripNest" className="border-b border-border bg-white">
      <Container className="py-8">
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3.5">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lagoon-50 text-lagoon-700">
                <Icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="font-display text-sm font-bold text-slate-900">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-border pt-5 text-sm text-muted-foreground">
          <strong className="text-slate-800">Portfolio demo.</strong>
          Hotels and reviews are sample data; payments run in Razorpay test mode, so no real money moves.
          <a
            href={siteConfig.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-lagoon-700 underline underline-offset-2 hover:no-underline"
          >
            <GithubIcon className="size-4" />
            View the source
          </a>
        </p>
      </Container>
    </section>
  );
}
