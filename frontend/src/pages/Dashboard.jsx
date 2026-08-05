import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import AnimatedCurrency from '../components/common/AnimatedCurrency.jsx';
import { HeroStatsSkeleton } from '../components/common/Skeletons.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface/90 backdrop-blur-xl text-white px-3 py-2 rounded-lg shadow-xl border border-white/20 text-xs font-mono">
        <p className="font-semibold">{data.name}</p>
        <p className="text-brand-light">${data.value.toFixed(2)} ({data.percentage}%)</p>
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

  const [reseeing, setReseeding] = useState(false);

  const handleReseedDemo = async () => {
    setReseeding(true);
    try {
      await api.post('/auth/demo-login', {});
      await fetchDashboard(currentMonth);
    } catch (err) {
      console.error('Reseed error:', err);
    } finally {
      setReseeding(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const currency = user?.currency || '$ USD';

  return (
    <AppLayout>
      {/* Demo Treasury Mode Banner */}
      {user?.email === 'demo@coffer.app' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl glass-surface border border-brand-light/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg"
        >
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-light to-brand-dark text-white flex items-center justify-center font-mono font-bold text-sm shrink-0 shadow-[0_0_15px_rgba(63,163,127,0.4)]">
              ⚡
            </span>
            <div>
              <p className="text-xs font-mono font-bold text-brand-light uppercase tracking-wider flex items-center gap-2">
                <span>Demo Treasury Mode Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-ping" />
              </p>
              <p className="text-xs text-ink-muted leading-relaxed">
                Inspecting live pre-seeded financial accounts, categories, and monthly cashflows.
              </p>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleReseedDemo}
            disabled={reseeing}
            className="glass-btn-secondary px-4 py-2 rounded-xl text-xs font-sans font-medium shrink-0 flex items-center gap-1.5 min-h-[38px]"
          >
            {reseeing ? (
              <span>Reseeding Vault...</span>
            ) : (
              <span>↻ Reset Demo Ledger Data</span>
            )}
          </motion.button>
        </motion.div>
      )}

      {/* Top Header & Month Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-fraunces text-3xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-sm">
            {getGreeting()}, {user?.displayName ? user.displayName.split(' ')[0] : 'Treasury Manager'}
          </h1>
          <p className="text-sm text-ink-muted font-sans mt-1">
            Live net worth aggregation and budget telemetry for your active ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentMonth(new Date().toISOString().slice(0, 7))}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
              currentMonth === new Date().toISOString().slice(0, 7)
                ? 'bg-gradient-to-r from-brand-dark to-brand-light text-white font-semibold border-white/20 shadow-[0_0_12px_rgba(63,163,127,0.4)]'
                : 'glass-surface border-white/10 text-ink-muted hover:text-white'
            }`}
          >
            Current Month
          </motion.button>
          <input
            id="monthSelect"
            type="month"
            value={currentMonth}
            onChange={(e) => setCurrentMonth(e.target.value)}
            className="glass-surface border border-white/15 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-brand-light shadow-inner"
          />
        </div>
      </div>

      {/* Hero Stats Section */}
      {loading ? (
        <HeroStatsSkeleton />
      ) : error ? (
        <div className="p-6 rounded-2xl bg-negative/20 border border-negative/40 text-negative text-sm mb-8 backdrop-blur-md">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Net Worth Hero Card */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl glass-ink grain-overlay text-white border border-brand-light/30 shadow-xl flex flex-col justify-between relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-light/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-brand-light font-semibold">
                  Total Net Worth
                </span>
                <div className="font-fraunces text-3xl xl:text-4xl font-light tracking-tight mt-2 text-white">
                  <AnimatedCurrency value={data.heroStats.netWorth} currency={currency} />
                </div>
              </div>
              <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-ink-muted">
                <span>LIQUID ASSETS</span>
                <span className="text-positive flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-positive animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </motion.div>

            {/* Total Income */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl glass-surface-interactive grain-overlay border border-white/10 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Period Inflow
                </span>
                <div className="font-fraunces text-2xl xl:text-3xl font-light tracking-tight mt-2 text-positive">
                  <AnimatedCurrency value={data.heroStats.totalIncome} currency={currency} showSign />
                </div>
              </div>
              <div className="mt-6 text-xs text-ink-muted font-sans">
                Logged income credits for {data.month}
              </div>
            </motion.div>

            {/* Total Spend */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl glass-surface-interactive grain-overlay border border-white/10 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Period Outflow
                </span>
                <div className="font-fraunces text-2xl xl:text-3xl font-light tracking-tight mt-2 text-white">
                  <AnimatedCurrency value={data.heroStats.totalSpend} currency={currency} />
                </div>
              </div>
              <div className="mt-6 text-xs text-ink-muted font-sans">
                Categorized expenses & bills
              </div>
            </motion.div>

            {/* Net Savings / Cashflow */}
            <motion.div
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="p-6 rounded-2xl glass-surface-interactive grain-overlay border border-white/10 flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-mono tracking-wider uppercase text-ink-muted">
                  Net Period Cashflow
                </span>
                <div className={`font-fraunces text-2xl xl:text-3xl font-light tracking-tight mt-2 ${
                  data.heroStats.net >= 0 ? 'text-positive' : 'text-negative'
                }`}>
                  <AnimatedCurrency value={data.heroStats.net} currency={currency} showSign />
                </div>
              </div>
              <div className="mt-6 text-xs text-ink-muted font-sans">
                {data.heroStats.net >= 0 ? 'Surplus cashflow buffer' : 'Deficit outflow requiring adjustment'}
              </div>
            </motion.div>
          </div>

          {/* Charts & Budgets Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            {/* Donut Chart - Spend Breakdown */}
            <div className="col-span-1 lg:col-span-6 p-6 rounded-2xl glass-surface grain-overlay border border-white/10 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-fraunces text-xl font-medium text-white">Outflow Allocation</h3>
                  <p className="text-xs text-ink-muted font-sans">Expense distribution across active categories</p>
                </div>
                <span className="font-mono text-xs text-brand-light px-2.5 py-1 rounded-full border border-brand-light/30 bg-brand/10">
                  {data.spendByCategory.length} categories
                </span>
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
                  <div className="h-56 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.spendByCategory}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={56}
                          outerRadius={84}
                          paddingAngle={4}
                        >
                          {data.spendByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || '#3FA37F'} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                    {data.spendByCategory.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 transition-all">
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: cat.color }} />
                          <span className="font-medium text-white truncate">{cat.name}</span>
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
            <div className="col-span-1 lg:col-span-6 p-6 rounded-2xl glass-surface grain-overlay border border-white/10 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-fraunces text-xl font-medium text-white">Budget Telemetry</h3>
                  <p className="text-xs text-ink-muted font-sans">Monthly category limits vs spent progression</p>
                </div>
                <Link to="/budgets" className="text-xs font-mono text-brand-light hover:underline flex items-center gap-1">
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
                      ? 'bg-gradient-to-r from-red-600 to-negative shadow-[0_0_12px_rgba(248,113,113,0.5)]'
                      : b.status === 'warning'
                      ? 'bg-gradient-to-r from-amber-600 to-warning shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                      : 'bg-gradient-to-r from-brand-dark to-brand-light shadow-[0_0_12px_rgba(63,163,127,0.5)]';

                    const percentClamped = Math.min(b.percentage, 100);

                    return (
                      <div key={b.id} className="space-y-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.categoryColor }} />
                            <span className="font-medium text-white">{b.categoryName}</span>
                          </div>
                          <div className="font-mono tabular-nums text-ink-muted">
                            <span className={b.status === 'danger' ? 'text-negative font-semibold' : 'text-white'}>
                              ${b.spent.toFixed(2)}
                            </span>
                            {' / '}
                            <span>${b.monthlyLimit.toFixed(2)}</span>
                            <span className="ml-1 opacity-75">({b.percentage}%)</span>
                          </div>
                        </div>

                        <div className="h-2.5 w-full rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
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
          <div className="p-6 rounded-2xl glass-surface border border-white/10 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-fraunces text-xl font-medium text-white">Recent Ledger Activity</h3>
                <p className="text-xs text-ink-muted font-sans">Most recent financial transactions recorded</p>
              </div>
              <Link to="/transactions">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-btn text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-md flex items-center gap-2"
                >
                  + Log / View All Ledger
                </motion.button>
              </Link>
            </div>

            {data.recentTransactions.length === 0 ? (
              <EmptyState
                icon="List"
                title="Ledger is empty"
                description="Your initial checking or savings accounts are seeded. Log your first salary deposit or expense entry to populate this table."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] font-mono tracking-wider uppercase text-ink-muted bg-white/5">
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Account</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Note</th>
                      <th className="py-3.5 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.recentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors duration-150">
                        <td className="py-3.5 px-4 font-mono text-xs text-ink-muted whitespace-nowrap">
                          {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-white text-xs">
                          {tx.account?.name || 'Account'}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white font-medium text-[11px]">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category?.color || '#9CA3AF' }} />
                            {tx.category?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-ink-muted text-xs truncate max-w-xs">
                          {tx.note || '—'}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono tabular-nums text-xs font-semibold ${
                          tx.type === 'INCOME' ? 'text-positive' : 'text-white'
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
