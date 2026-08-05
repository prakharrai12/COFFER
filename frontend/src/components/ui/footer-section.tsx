import React from 'react';
import { cn } from '@/lib/utils';
import AnimatedContainer from '@/components/ui/animated-container';
import { Vault, Globe, Mail, ExternalLink, ArrowUpRight } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Footer — Branded footer with Coffer's real links
   For use on marketing/landing pages only, not inside
   the authenticated dashboard shell.
   ───────────────────────────────────────────────────────── */

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const footerColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Dashboard', href: '/' },
      { label: 'Budgets', href: '/budgets' },
      { label: 'Ledger', href: '/transactions' },
      { label: 'Reports', href: '/reports' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Changelog', href: '#' },
      { label: 'Help', href: '#' },
      {
        label: 'GitHub',
        href: 'https://github.com/prakharrai12/COFFER',
        external: true,
      },
    ],
  },
];

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const socialLinks: SocialLink[] = [
  {
    label: 'Website',
    href: 'https://github.com/prakharrai12/COFFER',
    icon: <Globe className="w-4 h-4" />,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/prakharrai12/COFFER',
    icon: <ExternalLink className="w-4 h-4" />,
  },
  {
    label: 'Contact',
    href: 'mailto:hello@coffer.app',
    icon: <Mail className="w-4 h-4" />,
  },
];

export default function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={cn(
        'border-t border-[var(--border)] bg-[var(--surface)]',
        className,
      )}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Top section — Logo + Columns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
          {/* Brand column */}
          <AnimatedContainer delay={0} className="md:col-span-4">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center shadow-sm">
                <Vault className="w-4 h-4 text-white" />
              </div>
              <span className="font-mono text-sm font-bold tracking-[0.15em] uppercase text-[var(--ink)]">
                COFFER
              </span>
            </div>
            <p className="text-sm text-[var(--ink-muted)] leading-relaxed max-w-sm font-sans">
              Quiet precision for the modern treasury. Track accounts,
              categorize expenses, and monitor monthly budgets with surgical
              financial clarity.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center text-[var(--ink-muted)] hover:text-[var(--brand)] hover:border-[var(--brand)] transition-colors duration-200"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </AnimatedContainer>

          {/* Link columns */}
          {footerColumns.map((column, colIdx) => (
            <AnimatedContainer
              key={column.title}
              delay={0.08 * (colIdx + 1)}
              className="md:col-span-2 md:col-start-auto"
            >
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[var(--ink)] mb-4">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      {...(link.external
                        ? { target: '_blank', rel: 'noopener noreferrer' }
                        : {})}
                      className="text-sm text-[var(--ink-muted)] hover:text-[var(--brand)] transition-colors duration-200 font-sans inline-flex items-center gap-1"
                    >
                      {link.label}
                      {link.external && (
                        <ArrowUpRight className="w-3 h-3 opacity-50" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </AnimatedContainer>
          ))}
        </div>

        {/* Bottom bar */}
        <AnimatedContainer delay={0.4}>
          <div className="pt-8 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[var(--ink-muted)] font-mono">
              © {new Date().getFullYear()} COFFER. All rights reserved.
            </p>
            <p className="text-xs text-[var(--ink-muted)] font-mono">
              PRECISION AGGREGATION ENGINE • TABULAR NUMERALS
            </p>
          </div>
        </AnimatedContainer>
      </div>
    </footer>
  );
}
