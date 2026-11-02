import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { footerNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { Logo } from "@/components/ui/logo";
import { CurrentYear } from "@/components/layout/current-year";

export function Footer() {
  return (
    <footer className="bg-brand-950 text-slate-300">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{siteConfig.description}</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-brand-300" aria-hidden="true" />
              <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                {siteConfig.contact.email}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-brand-300" aria-hidden="true" />
              <span>{siteConfig.contact.phone}</span>
            </li>
          </ul>
        </div>

        {footerNav.map((group) => (
          <div key={group.title}>
            <h2 className="font-display text-sm font-semibold tracking-wide text-white uppercase">{group.title}</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-400 transition-colors hover:text-white">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}. All rights reserved.
          </p>
          <p>{siteConfig.tagline}</p>
        </Container>
      </div>
    </footer>
  );
}
