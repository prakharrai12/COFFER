import React from 'react';
import AnimatedContainer from '@/components/ui/animated-container';
import {
  BarChart3,
  Wallet,
  Globe,
  RefreshCw,
  TrendingUp,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   FeatureBento — Landing page bento grid
   5 tiles showcasing Coffer's core features, with 
   staggered scroll-reveal and hover lift.
   ───────────────────────────────────────────────────────── */

interface BentoTile {
  title: string;
  description: string;
  icon: React.ReactNode;
  span: 'large' | 'small';
  visual: React.ReactNode;
}

// ── Budget progress bar visual ──────────────────────────
function BudgetBars() {
  const bars = [
    { label: 'Housing', pct: 72, color: 'var(--brand)' },
    { label: 'Food', pct: 91, color: 'var(--warning)' },
    { label: 'Transport', pct: 110, color: 'var(--negative)' },
  ];

  return (
    <div className="space-y-3 mt-4">
      {bars.map((bar) => (
        <div key={bar.label} className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono">
            <span className="text-[var(--ink-muted)]">{bar.label}</span>
            <span className="text-[var(--ink-muted)]">{bar.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.min(bar.pct, 100)}%`,
                backgroundColor: bar.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Currency symbols visual ─────────────────────────────
function CurrencySymbols() {
  const symbols = ['$', '₹', '€', '£', '¥'];
  return (
    <div className="flex items-center gap-3 mt-4">
      {symbols.map((s, i) => (
        <span
          key={s}
          className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center font-mono text-lg text-[var(--ink)] transition-transform duration-200 hover:scale-110"
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

// ── Mini bar chart visual ───────────────────────────────
function MiniBarChart() {
  const heights = [40, 65, 50, 80, 55, 70, 90, 60, 75, 85, 45, 95];
  return (
    <div className="flex items-end gap-1 mt-4 h-16">
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t transition-all duration-500"
          style={{
            height: `${h}%`,
            backgroundColor:
              i === heights.length - 1
                ? 'var(--brand)'
                : 'var(--border)',
          }}
        />
      ))}
    </div>
  );
}

// ── Dashboard mock visual ───────────────────────────────
function DashboardMock() {
  return (
    <div className="mt-6 p-4 rounded-lg border border-[var(--border)] bg-[var(--canvas)]">
      {/* Mini nav bar */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border)]">
        <div className="w-4 h-4 rounded bg-[var(--brand)]" />
        <div className="h-2 w-12 rounded bg-[var(--border)]" />
        <div className="ml-auto flex gap-1.5">
          <div className="h-2 w-8 rounded bg-[var(--border)]" />
          <div className="h-2 w-8 rounded bg-[var(--border)]" />
          <div className="h-2 w-8 rounded bg-[var(--border)]" />
        </div>
      </div>

      {/* Hero stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="p-2 rounded bg-[var(--ink)] col-span-1">
          <div className="h-1.5 w-8 rounded bg-[var(--ink-muted)] mb-1.5" />
          <div className="h-3 w-14 rounded bg-[var(--brand)]" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-2 rounded border border-[var(--border)]">
            <div className="h-1.5 w-6 rounded bg-[var(--border)] mb-1.5" />
            <div className="h-3 w-10 rounded bg-[var(--surface-raised)]" />
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div className="grid grid-cols-2 gap-2">
        <div className="h-12 rounded border border-[var(--border)] flex items-end p-2 gap-0.5">
          {[30, 50, 40, 70, 60, 45, 80].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t bg-[var(--brand)]"
              style={{ height: `${h}%`, opacity: 0.3 + i * 0.1 }}
            />
          ))}
        </div>
        <div className="h-12 rounded border border-[var(--border)] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-[3px] border-[var(--brand)] border-t-transparent" />
        </div>
      </div>
    </div>
  );
}

const tiles: BentoTile[] = [
  {
    title: 'Sub-3 second net worth clarity',
    description:
      'Live aggregation across all accounts. Your full financial picture, always current, always precise.',
    icon: <BarChart3 className="w-5 h-5" />,
    span: 'large',
    visual: <DashboardMock />,
  },
  {
    title: 'Know before you overspend',
    description:
      'Budget telemetry with green→amber→red status progression. Limits enforced, not suggested.',
    icon: <Wallet className="w-5 h-5" />,
    span: 'small',
    visual: <BudgetBars />,
  },
  {
    title: 'One ledger, every currency',
    description:
      'USD, EUR, GBP, INR, JPY — manage multi-currency accounts from a single workspace.',
    icon: <Globe className="w-5 h-5" />,
    span: 'small',
    visual: <CurrencySymbols />,
  },
  {
    title: 'Bills that log themselves',
    description:
      'Auto-recurring transaction engine. Set it once, watch your ledger stay current month over month.',
    icon: <RefreshCw className="w-5 h-5" />,
    span: 'small',
    visual: (
      <div className="mt-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-[var(--brand)] animate-[spin_4s_linear_infinite]" />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 w-20 rounded bg-[var(--border)]" />
          <div className="h-1.5 w-14 rounded bg-[var(--border)]" />
        </div>
      </div>
    ),
  },
  {
    title: 'Months of cashflow, one glance',
    description:
      'Longitudinal trend analytics. Spot patterns across months of spending and income data.',
    icon: <TrendingUp className="w-5 h-5" />,
    span: 'small',
    visual: <MiniBarChart />,
  },
];

export default function FeatureBento() {
  return (
    <section className="bg-[var(--canvas)] py-20 px-6 sm:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <AnimatedContainer delay={0} className="text-center mb-14">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-[var(--brand)] mb-3 block">
            Built for precision
          </span>
          <h2 className="font-fraunces text-3xl sm:text-4xl font-medium tracking-tight text-[var(--ink)] mb-4">
            Every feature earns its place
          </h2>
          <p className="text-[var(--ink-muted)] font-sans text-base max-w-lg mx-auto leading-relaxed">
            No feature bloat. Every tool in Coffer exists because it makes your
            financial picture clearer, faster, or more precise.
          </p>
        </AnimatedContainer>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tiles.map((tile, i) => (
            <AnimatedContainer
              key={tile.title}
              delay={0.08 * (i + 1)}
              className={
                tile.span === 'large'
                  ? 'sm:col-span-2 lg:col-span-2'
                  : 'col-span-1'
              }
            >
              <div className="h-full p-6 rounded-lg bg-[var(--surface)] border border-[var(--border)] hover:scale-[1.01] hover:shadow-md transition-all duration-150 ease-out cursor-default group">
                {/* Icon + Title */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] shrink-0 group-hover:bg-[var(--brand)]/15 transition-colors">
                    {tile.icon}
                  </div>
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-[var(--ink)] leading-tight">
                      {tile.title}
                    </h3>
                    <p className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">
                      {tile.description}
                    </p>
                  </div>
                </div>

                {/* Visual */}
                {tile.visual}
              </div>
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
