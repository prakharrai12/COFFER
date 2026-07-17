import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import { TableSkeleton } from '../components/common/Skeletons.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import TransactionModal from '../components/transactions/TransactionModal.jsx';

const Transactions = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, net: 0 });
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    accountId: 'ALL',
    categoryId: 'ALL',
    type: 'ALL',
    search: '',
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchFiltersData = async () => {
    try {
      const [accRes, catRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories'),
      ]);
      setAccounts(accRes.accounts || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load accounts/categories for filter:', err);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.accountId !== 'ALL') params.append('accountId', filters.accountId);
      if (filters.categoryId !== 'ALL') params.append('categoryId', filters.categoryId);
      if (filters.type !== 'ALL') params.append('type', filters.type);
      if (filters.search.trim()) params.append('search', filters.search.trim());
      params.append('limit', '200'); // high density view

      const res = await api.get(`/transactions?${params.toString()}`);
      setTransactions(res.transactions || []);
      setSummary(res.summary || { totalIncome: 0, totalExpense: 0, net: 0 });
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      accountId: 'ALL',
      categoryId: 'ALL',
      type: 'ALL',
      search: '',
    });
  };

  const handleOpenCreate = () => {
    setSelectedTx(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tx) => {
    setSelectedTx(tx);
    setIsModalOpen(true);
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-fraunces text-3xl font-medium tracking-tight text-ink">
            Financial Ledger
          </h1>
          <p className="text-sm text-ink-muted font-sans">
            Surgical audit trail of all historical and scheduled cash flows across active accounts.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-brand hover:bg-brand-light text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-all duration-200 text-xs font-sans flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+ Log Transaction</span>
        </button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="p-4 rounded-lg bg-surface border border-border shadow-2xs mb-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2">
            <label htmlFor="search" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
              Note Search
            </label>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Filter by memo text..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full rounded border border-border bg-canvas px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors duration-150"
            />
          </div>

          {/* Account Filter */}
          <div>
            <label htmlFor="accountIdFilter" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
              Account
            </label>
            <select
              id="accountIdFilter"
              name="accountId"
              value={filters.accountId}
              onChange={handleFilterChange}
              className="w-full rounded border border-border bg-canvas px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors duration-150"
            >
              <option value="ALL">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="categoryIdFilter" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
              Category
            </label>
            <select
              id="categoryIdFilter"
              name="categoryId"
              value={filters.categoryId}
              onChange={handleFilterChange}
              className="w-full rounded border border-border bg-canvas px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors duration-150"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="typeFilter" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
              Flow Type
            </label>
            <select
              id="typeFilter"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full rounded border border-border bg-canvas px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors duration-150"
            >
              <option value="ALL">All Flows</option>
              <option value="EXPENSE">Expense Only</option>
              <option value="INCOME">Income Only</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 px-2 text-[11px] font-mono uppercase rounded border border-border bg-surface hover:bg-canvas text-ink-muted hover:text-ink transition-colors duration-150 text-center min-h-[38px]"
            >
              Clear Filters ↺
            </button>
          </div>
        </div>

        {/* Quick Audit Shortcut Chips */}
        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-sans">
          <span className="text-[10px] font-mono text-ink-muted uppercase mr-1">Quick Filters:</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: '', type: 'ALL', accountId: 'ALL', categoryId: 'ALL' }))}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${!filters.search && filters.type === 'ALL' && filters.categoryId === 'ALL' ? 'bg-brand text-white border-brand font-medium' : 'bg-canvas border-border text-ink-muted hover:text-ink'}`}
          >
            All Ledger
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: 'Market', type: 'EXPENSE' }))}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${filters.search === 'Market' ? 'bg-brand text-white border-brand font-medium' : 'bg-canvas border-border text-ink-muted hover:text-ink'}`}
          >
            🛒 Groceries & Dining
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: 'Payroll', type: 'INCOME' }))}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${filters.search === 'Payroll' ? 'bg-brand text-white border-brand font-medium' : 'bg-canvas border-border text-ink-muted hover:text-ink'}`}
          >
            💰 Salary Inflow
          </button>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, search: 'Lease', type: 'EXPENSE' }))}
            className={`px-2.5 py-1 rounded-full text-[11px] border transition-colors ${filters.search === 'Lease' ? 'bg-brand text-white border-brand font-medium' : 'bg-canvas border-border text-ink-muted hover:text-ink'}`}
          >
            🏠 Housing & HOA
          </button>
        </div>

        {/* Date Range Sub-row */}
        <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span>DATE BOUNDS:</span>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="rounded border border-border bg-canvas px-2 py-1 text-xs text-ink focus:outline-none focus:border-brand"
            />
            <span>→</span>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="rounded border border-border bg-canvas px-2 py-1 text-xs text-ink focus:outline-none focus:border-brand"
            />
          </div>

          {/* Summary Stats for matching subset */}
          <div className="flex items-center gap-6 tabular-nums">
            <span>INFLOW: <strong className="text-positive">+${summary.totalIncome.toFixed(2)}</strong></span>
            <span>OUTFLOW: <strong className="text-ink">-${summary.totalExpense.toFixed(2)}</strong></span>
            <span>NET: <strong className={summary.net >= 0 ? 'text-positive' : 'text-negative'}>
              {summary.net >= 0 ? '+' : '-'}${Math.abs(summary.net).toFixed(2)}
            </strong></span>
          </div>
        </div>
      </div>

      {/* High-Density Table View */}
      {loading ? (
        <TableSkeleton rows={8} />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon="Table"
          title="No matching records found"
          description="We found zero transactions matching your selected date bounds, account filter, or memo search criteria."
          actionLabel="Clear Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="w-full rounded-lg border border-border bg-surface shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-canvas/60 text-[11px] font-mono tracking-wider uppercase text-ink-muted select-none">
                  <th className="py-3 px-4 w-28">Date</th>
                  <th className="py-3 px-4 w-40">Account</th>
                  <th className="py-3 px-4 w-44">Category</th>
                  <th className="py-3 px-4">Description / Note</th>
                  <th className="py-3 px-4 w-28 text-center">Schedule</th>
                  <th className="py-3 px-4 w-32 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => handleOpenEdit(tx)}
                    className="hover:bg-canvas/60 transition-colors duration-150 cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono text-ink-muted whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-medium text-ink truncate max-w-[10rem]">
                      {tx.account?.name || 'Account'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised border border-border text-ink font-medium text-[11px]">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tx.category?.color || '#5B6158' }} />
                        <span>{tx.category?.name || 'Uncategorized'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-ink font-sans pr-6 group-hover:text-brand transition-colors duration-150">
                      {tx.note || <span className="text-ink-muted/50 italic">No memo logged</span>}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[10px]">
                      {tx.isRecurring ? (
                        <span className="bg-brand/10 text-brand border border-brand/20 px-2 py-0.5 rounded uppercase tracking-wide">
                          ↻ {tx.recurringInterval || 'AUTO'}
                        </span>
                      ) : (
                        <span className="text-ink-muted/40">—</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 text-right font-mono tabular-nums font-semibold text-sm ${
                      tx.type === 'INCOME' ? 'text-positive' : 'text-ink'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="py-3 px-4 border-t border-border bg-canvas/40 flex items-center justify-between text-xs font-mono text-ink-muted">
            <span>Showing {transactions.length} matching transactions</span>
            <span>Click any record to inspect or modify allocation</span>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={fetchTransactions}
        transaction={selectedTx}
        accounts={accounts}
        categories={categories}
      />
    </AppLayout>
  );
};

export default Transactions;
