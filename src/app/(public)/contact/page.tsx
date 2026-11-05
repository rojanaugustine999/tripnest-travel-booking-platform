import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PageHeader } from "@/components/common/page-header";
import { Section } from "@/components/common/section";
import { GithubIcon } from "@/components/ui/github-icon";
import { ContactForm } from "@/features/marketing/components/contact-form";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about a booking, your account or listing a property? Get in touch with the TripNest team.",
};

const details: { icon: React.ElementType; label: string; value: string; href?: string }[] = [
  ...(siteConfig.contact.email
    ? [{ icon: Mail, label: "Email", value: siteConfig.contact.email, href: `mailto:${siteConfig.contact.email}` }]
    : []),
  ...(siteConfig.contact.phone ? [{ icon: Phone, label: "Phone", value: siteConfig.contact.phone }] : []),
  { icon: GithubIcon, label: "Source code", value: "github.com/rojanaugustine999", href: siteConfig.repoUrl },
  { icon: Clock, label: "Support hours", value: "Mon–Sat, 9:00 – 19:00 IST" },
  { icon: MapPin, label: "Office", value: "Kochi, Kerala, India" },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        top={<Breadcrumbs inverted items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />}
        eyebrow="Contact"
        title="We're here to help"
        description="Send us a message and our team will get back to you within one working day."
      />
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-900/5 sm:p-8">
            <h2 className="text-h3">Send a message</h2>
            <p className="mt-1 mb-6 text-sm text-muted-foreground">Fields marked * are required.</p>
            <ContactForm />
          </div>

          <aside aria-labelledby="contact-details" className="space-y-6">
            <h2 id="contact-details" className="text-h4">
              Other ways to reach us
            </h2>
            <ul className="space-y-5">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-lagoon-50 text-lagoon-700">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-lagoon-700 hover:underline">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-600">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <p className="rounded-xl bg-slate-50 p-4 text-xs text-muted-foreground">
              TripNest is a portfolio project. Support hours and the office are fictional, and the form does not send
              messages yet.
            </p>
          </aside>
        </div>
      </Section>
    </>
  );
}
