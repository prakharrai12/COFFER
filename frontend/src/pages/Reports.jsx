import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import api from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import { CardSkeleton } from '../components/common/Skeletons.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const CustomReportsTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-ink text-canvas p-3 rounded shadow-lg border border-border/20 text-xs font-mono space-y-1">
        <p className="font-bold border-b border-border/20 pb-1 mb-1.5">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>● {entry.name}:</span>
            <span className="tabular-nums font-semibold">${entry.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [monthsCount, setMonthsCount] = useState('12');
  const [error, setError] = useState('');

  const fetchHistory = async (months) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/analytics/history?months=${months}`);
      setHistory(res.history || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch historical analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(monthsCount);
  }, [monthsCount]);

  // Aggregate totals across all queried months
  const totalInflow = history.reduce((acc, h) => acc + h.income, 0);
  const totalOutflow = history.reduce((acc, h) => acc + h.spend, 0);
  const totalNet = totalInflow - totalOutflow;
  const avgMonthlySpend = history.length > 0 ? totalOutflow / history.length : 0;

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-fraunces text-3xl font-medium tracking-tight text-ink">
            Historical Analytics & Trends
          </h1>
          <p className="text-sm text-ink-muted font-sans">
            Longitudinal inflow vs. outflow velocity comparison across consecutive reporting periods.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ink-muted uppercase">Period Range:</span>
          {['6', '12'].map((m) => (
            <button
              key={m}
              onClick={() => setMonthsCount(m)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors duration-150 ${
                monthsCount === m
                  ? 'bg-ink text-canvas font-semibold shadow-2xs'
                  : 'bg-surface border border-border text-ink-muted hover:text-ink'
              }`}
            >
              Last {m} Months
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate Banner */}
      {!loading && !error && history.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-lg bg-surface border border-border shadow-2xs">
            <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">
              Period Total Inflow
            </span>
            <div className="font-fraunces text-2xl font-medium text-positive mt-1 tabular-nums">
              +${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border shadow-2xs">
            <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">
              Period Total Outflow
            </span>
            <div className="font-fraunces text-2xl font-medium text-ink mt-1 tabular-nums">
              -${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border shadow-2xs">
            <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">
              Net Period Position
            </span>
            <div className={`font-fraunces text-2xl font-medium mt-1 tabular-nums ${
              totalNet >= 0 ? 'text-positive' : 'text-negative'
            }`}>
              {totalNet >= 0 ? '+' : '-'}${Math.abs(totalNet).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="p-5 rounded-lg bg-surface border border-border shadow-2xs">
            <span className="text-[10px] font-mono tracking-wider uppercase text-ink-muted">
              Avg. Monthly Burn
            </span>
            <div className="font-fraunces text-2xl font-medium text-ink-muted mt-1 tabular-nums">
              ${avgMonthlySpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}/mo
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs mb-8">
        <h3 className="font-fraunces text-lg font-medium text-ink mb-1">
          Inflow vs. Outflow Progression
        </h3>
        <p className="text-xs text-ink-muted font-sans mb-6">
          Side-by-side monthly financial comparison. Hover over bars to inspect precise figures.
        </p>

        {loading ? (
          <CardSkeleton />
        ) : error ? (
          <div className="p-4 rounded bg-negative/10 border border-negative/30 text-negative text-xs">
            {error}
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon="BarChart"
            title="No historical telemetry found"
            description="Log transactions across different months to visualize your wealth trajectory."
          />
        ) : (
          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis dataKey="monthLabel" stroke="var(--ink-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--ink-muted)" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val}`} />
                <Tooltip content={<CustomReportsTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="income" name="Inflow (Income)" fill="var(--positive)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="spend" name="Outflow (Expense)" fill="var(--ink)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Tabular History Audit Grid */}
      {!loading && history.length > 0 && (
        <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
          <h3 className="font-fraunces text-lg font-medium text-ink mb-4">
            Monthly Ledger Audit Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-canvas/60 text-[11px] font-mono tracking-wider uppercase text-ink-muted select-none">
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Inflow ($)</th>
                  <th className="py-3 px-4 text-right">Outflow ($)</th>
                  <th className="py-3 px-4 text-right">Net Cashflow ($)</th>
                  <th className="py-3 px-4 text-center">Efficiency Ratio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.map((row) => {
                  const savingsRate = row.income > 0
                    ? Math.round(((row.income - row.spend) / row.income) * 100)
                    : 0;

                  return (
                    <tr key={row.month} className="hover:bg-canvas/50 transition-colors duration-150">
                      <td className="py-3 px-4 font-mono font-medium text-ink">
                        {row.month} ({row.monthLabel})
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-positive font-semibold">
                        +${row.income.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-ink">
                        -${row.spend.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono tabular-nums font-semibold ${
                        row.net >= 0 ? 'text-positive' : 'text-negative'
                      }`}>
                        {row.net >= 0 ? '+' : '-'}${Math.abs(row.net).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[11px]">
                        {row.income > 0 ? (
                          <span className={`px-2 py-0.5 rounded ${
                            savingsRate >= 20
                              ? 'bg-positive/10 text-positive font-medium'
                              : savingsRate >= 0
                              ? 'bg-warning/10 text-warning'
                              : 'bg-negative/10 text-negative font-semibold'
                          }`}>
                            {savingsRate}% Saved
                          </span>
                        ) : (
                          <span className="text-ink-muted/50">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default Reports;
