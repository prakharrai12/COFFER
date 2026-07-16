import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import AnimatedCurrency from '../components/common/AnimatedCurrency.jsx';
import { HeroStatsSkeleton, CardSkeleton } from '../components/common/Skeletons.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-ink text-canvas px-3 py-2 rounded shadow-md border border-border/20 text-xs font-mono">
        <p className="font-semibold">{data.name}</p>
        <p className="text-canvas/80">${data.value.toFixed(2)} ({data.percentage}%)</p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    return new Date().toISOString().slice(0, 7);
  });

  const fetchDashboard = async (month) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/analytics/dashboard?month=${month}`);
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(currentMonth);
  }, [currentMonth]);

  const currency = user?.currency || '$ USD';

  return (
    <AppLayout>
      {/* Top Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-fraunces text-3xl font-medium tracking-tight text-ink">
            Financial Command Center
          </h1>
          <p className="text-sm text-ink-muted font-sans">
            Live net worth aggregation and budget telemetry for your active ledger.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="monthSelect" className="text-xs font-mono uppercase text-ink-muted">
            Period:
          </label>
          <input
            id="monthSelect"
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-brand shadow-2xs"
          />
        </div>
      </div>

      {/* Hero Stats Section */}
      {loading ? (
        <HeroStatsSkeleton />
      ) : error ? (
        <div className="p-6 rounded-lg bg-negative/10 border border-negative/30 text-negative text-sm mb-8">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Net Worth Hero */}
            <div className="p-6 rounded-lg bg-ink text-canvas border border-ink shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Total Net Worth
                </span>
                <div className="font-fraunces text-3xl xl:text-4xl font-light tracking-tight mt-1 text-canvas">
                  <AnimatedCurrency value={data.heroStats.netWorth} currency={currency} />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/10 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                <span>LIQUID ASSETS</span>
                <span className="text-positive">● ACTIVE</span>
              </div>
            </div>

            {/* Total Income */}
            <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Period Inflow
                </span>
                <div className="font-fraunces text-2xl xl:text-3xl font-light tracking-tight mt-1 text-positive">
                  <AnimatedCurrency value={data.heroStats.totalIncome} currency={currency} showSign />
                </div>
              </div>
              <div className="mt-4 text-xs text-ink-muted font-sans">
                Logged income credits for {data.month}
              </div>
            </div>

            {/* Total Spend */}
            <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Period Outflow
                </span>
                <div className="font-fraunces text-2xl xl:text-3xl font-light tracking-tight mt-1 text-ink">
                  <AnimatedCurrency value={data.heroStats.totalSpend} currency={currency} />
                </div>
              </div>
              <div className="mt-4 text-xs text-ink-muted font-sans">
                Categorized expenses & bills
              </div>
            </div>

            {/* Net Savings / Cashflow */}
            <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Net Period Cashflow
                </span>
                <div className={`font-fraunces text-2xl xl:text-3xl font-light tracking-tight mt-1 ${
                  data.heroStats.net >= 0 ? 'text-positive' : 'text-negative'
                }`}>
                  <AnimatedCurrency value={data.heroStats.net} currency={currency} showSign />
                </div>
              </div>
              <div className="mt-4 text-xs text-ink-muted font-sans">
                {data.heroStats.net >= 0 ? 'Surplus cashflow buffer' : 'Deficit outflow requiring adjustment'}
              </div>
            </div>
          </div>

          {/* Charts & Budgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Donut Chart - Spend Breakdown */}
            <div className="col-span-1 lg:col-span-6 p-6 rounded-lg bg-surface border border-border shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-fraunces text-lg font-medium text-ink">Outflow Allocation</h3>
                  <p className="text-xs text-ink-muted font-sans">Expense distribution across active categories</p>
                </div>
                <span className="font-mono text-xs text-ink-muted">{data.spendByCategory.length} categories</span>
              </div>

              {data.spendByCategory.length === 0 ? (
                <div className="my-auto">
                  <EmptyState
                    icon="Pie"
                    title="No category outflow logged"
                    description="When you record expense transactions for this period, their visual category allocation will populate here automatically."
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center my-auto">
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.spendByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={54}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {data.spendByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#1F5F4D'} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2.5 max-h-52 overflow-y-auto pr-2">
                    {data.spendByCategory.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                          <span className="font-medium text-ink truncate">{cat.name}</span>
                        </div>
                        <div className="font-mono tabular-nums shrink-0 text-ink-muted">
                          ${cat.value.toFixed(2)} ({cat.percentage}%)
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Budget Progress Bars */}
            <div className="col-span-1 lg:col-span-6 p-6 rounded-lg bg-surface border border-border shadow-2xs flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-fraunces text-lg font-medium text-ink">Budget Telemetry</h3>
                  <p className="text-xs text-ink-muted font-sans">Monthly category limits vs spent progression</p>
                </div>
                <Link to="/budgets" className="text-xs font-mono text-brand hover:underline">
                  Configure Limits →
                </Link>
              </div>

              {data.budgetSummary.length === 0 ? (
                <div className="my-auto">
                  <EmptyState
                    icon="Target"
                    title="No budget targets active"
                    description="Define monthly spending limits for categories like Food, Housing, or Entertainment to track consumption velocity."
                    actionLabel="Set Budgets"
                    onAction={() => window.location.href = '/budgets'}
                  />
                </div>
              ) : (
                <div className="space-y-5 my-auto max-h-64 overflow-y-auto pr-2">
                  {data.budgetSummary.map((b) => {
                    const barBg = b.status === 'danger'
                      ? 'bg-negative'
                      : b.status === 'warning'
                      ? 'bg-warning'
                      : 'bg-brand';

                    const percentClamped = Math.min(b.percentage, 100);

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.categoryColor }} />
                            <span className="font-medium text-ink">{b.categoryName}</span>
                          </div>
                          <div className="font-mono tabular-nums text-ink-muted">
                            <span className={b.status === 'danger' ? 'text-negative font-semibold' : 'text-ink'}>
                              ${b.spent.toFixed(2)}
                            </span>
                            {' / '}
                            <span>${b.monthlyLimit.toFixed(2)}</span>
                            <span className="ml-1 opacity-75">({b.percentage}%)</span>
                          </div>
                        </div>

                        <div className="h-2 w-full rounded-full bg-border/50 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${barBg}`}
                            style={{ width: `${percentClamped}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions Section */}
          <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-fraunces text-lg font-medium text-ink">Recent Ledger Activity</h3>
                <p className="text-xs text-ink-muted font-sans">Most recent financial transactions recorded</p>
              </div>
              <Link
                to="/transactions"
                className="bg-brand hover:bg-brand-light text-white text-xs font-medium px-4 py-2 rounded-md shadow-2xs transition-colors duration-200"
              >
                + Log / View All Ledger
              </Link>
            </div>

            {data.recentTransactions.length === 0 ? (
              <EmptyState
                icon="List"
                title="Ledger is empty"
                description="Your initial checking or savings accounts are seeded. Log your first salary deposit or expense entry to populate this table."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] font-mono tracking-wider uppercase text-ink-muted bg-canvas/40">
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3">Account</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3">Note</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-canvas/50 transition-colors duration-150">
                        <td className="py-3 px-3 font-mono text-xs text-ink-muted whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                        </td>
                        <td className="py-3 px-3 font-medium text-ink text-xs">
                          {tx.account?.name || 'Account'}
                        </td>
                        <td className="py-3 px-3 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-canvas border border-border text-ink font-medium text-[11px]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category?.color || '#5B6158' }} />
                            {tx.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-ink-muted text-xs truncate max-w-xs">
                          {tx.note || '—'}
                        </td>
                        <td className={`py-3 px-3 text-right font-mono tabular-nums text-xs font-semibold ${
                          tx.type === 'INCOME' ? 'text-positive' : 'text-ink'
                        }`}>
                          {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </AppLayout>
  );
};

export default Dashboard;
