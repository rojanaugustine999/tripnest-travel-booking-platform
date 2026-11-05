import Link from "next/link";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { footerNav, siteConfig } from "@/config/site";
import { Container } from "@/components/ui/container";
import { GithubIcon } from "@/components/ui/github-icon";
import { Logo } from "@/components/ui/logo";
import { CurrentYear } from "@/components/layout/current-year";

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{siteConfig.description}</p>
          <ul className="mt-6 space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <MessageSquare className="size-4 text-lagoon-300" aria-hidden="true" />
              <Link href="/contact" className="hover:text-white">
                Send us a message
              </Link>
            </li>
            {siteConfig.contact.email && (
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-lagoon-300" aria-hidden="true" />
                <a href={`mailto:${siteConfig.contact.email}`} className="hover:text-white">
                  {siteConfig.contact.email}
                </a>
              </li>
            )}
            {siteConfig.contact.phone && (
              <li className="flex items-center gap-2">
                <Phone className="size-4 text-lagoon-300" aria-hidden="true" />
                <span>{siteConfig.contact.phone}</span>
              </li>
            )}
            <li className="flex items-center gap-2">
              <GithubIcon className="size-4 text-lagoon-300" />
              <a href={siteConfig.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                View the source on GitHub
              </a>
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
        <Container className="flex flex-col gap-2 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © <CurrentYear /> {siteConfig.name}. All rights reserved.
          </p>
          <p>Designed &amp; Developed by Rojan Augustine.</p>
        </Container>
      </div>
    </footer>
  );
}
