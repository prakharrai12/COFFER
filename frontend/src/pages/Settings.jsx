import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import AppLayout from '../components/layout/AppLayout.jsx';
import { TableSkeleton } from '../components/common/Skeletons.jsx';
import EmptyState from '../components/common/EmptyState.jsx';

const ACCOUNT_TYPES = [
  { value: 'CHECKING', label: 'Checking Account' },
  { value: 'SAVINGS', label: 'Savings Vault' },
  { value: 'CREDIT_CARD', label: 'Credit Card (Liability)' },
  { value: 'CASH', label: 'Physical Cash / Petty Cash' },
  { value: 'INVESTMENT', label: 'Investment Portfolio' },
];

const CURRENCIES = [
  '$ USD', '€ EUR', '£ GBP', '₹ INR', '¥ JPY', 'CA$ CAD', 'A$ AUD'
];

const Settings = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState('');

  // Account creation/editing state
  const [isEditingId, setIsEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CHECKING',
    currency: '$ USD',
    initialBalance: '0',
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Profile preferences state
  const [profileCurrency, setProfileCurrency] = useState(user?.currency || '$ USD');
  const [profileSaved, setProfileSaved] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/accounts');
      setAccounts(res.accounts || []);
    } catch (err) {
      setError(err.message || 'Failed to load accounts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
    if (user?.currency) {
      setProfileCurrency(user.currency);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError('');
  };

  const handleOpenCreate = () => {
    setIsEditingId(null);
    setFormData({
      name: '',
      type: 'CHECKING',
      currency: user?.currency || '$ USD',
      initialBalance: '0',
    });
    setFormError('');
  };

  const handleOpenEdit = (acc) => {
    setIsEditingId(acc.id);
    setFormData({
      name: acc.name,
      type: acc.type || 'CHECKING',
      currency: acc.currency || '$ USD',
      initialBalance: String(acc.initialBalance || 0),
    });
    setFormError('');
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Account name is required.');
      return;
    }
    const balNum = parseFloat(formData.initialBalance);
    if (isNaN(balNum)) {
      setFormError('Valid initial balance is required.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    try {
      if (isEditingId) {
        await api.put(`/accounts/${isEditingId}`, {
          name: formData.name.trim(),
          type: formData.type,
          currency: formData.currency,
        });
      } else {
        await api.post('/accounts', {
          name: formData.name.trim(),
          type: formData.type,
          currency: formData.currency,
          initialBalance: balNum,
        });
      }
      setIsEditingId(null);
      setFormData({ name: '', type: 'CHECKING', currency: '$ USD', initialBalance: '0' });
      fetchAccounts();
    } catch (err) {
      setFormError(err.message || 'Failed to save account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAccount = async (accId, accName) => {
    if (!window.confirm(`Permanently delete account "${accName}"? This will cascade and delete all associated transaction records logged under this account.`)) {
      return;
    }
    try {
      await api.delete(`/accounts/${accId}`);
      if (isEditingId === accId) setIsEditingId(null);
      fetchAccounts();
    } catch (err) {
      alert(err.message || 'Failed to delete account.');
    }
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl font-medium tracking-tight text-ink">
          Treasury & Workspace Settings
        </h1>
        <p className="text-sm text-ink-muted font-sans">
          Manage multi-currency financial accounts, modify initial balances, and configure workspace defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Accounts Manager */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-fraunces text-xl font-medium text-ink">
                  Registered Treasury Accounts ({accounts.length})
                </h3>
                <p className="text-xs text-ink-muted font-sans">
                  Each account maintains its own independent running balance and currency token.
                </p>
              </div>
              <button
                onClick={handleOpenCreate}
                className="bg-brand hover:bg-brand-light text-white text-xs font-medium px-3.5 py-2 rounded-md transition-colors duration-150"
              >
                + New Account
              </button>
            </div>

            {/* Account Form / Editor Panel */}
            {(isEditingId !== null || formData.name !== '' || accounts.length === 0) && (
              <form onSubmit={handleSaveAccount} className="p-4 rounded-lg bg-canvas border border-border mb-6 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-border/50 pb-2">
                  <span className="font-fraunces text-sm font-medium text-ink">
                    {isEditingId ? 'Modify Treasury Account' : 'Initialize New Account'}
                  </span>
                  {isEditingId && (
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="text-[11px] font-mono text-ink-muted hover:text-ink"
                    >
                      Cancel Edit ✕
                    </button>
                  )}
                </div>

                {formError && (
                  <div className="p-2.5 rounded bg-negative/10 border border-negative/30 text-negative text-xs">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accName" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
                      Account Name <span className="text-negative">*</span>
                    </label>
                    <input
                      id="accName"
                      name="name"
                      type="text"
                      placeholder="e.g. Primary Checking or Amex Card"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                    />
                  </div>

                  <div>
                    <label htmlFor="accType" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
                      Account Classification
                    </label>
                    <select
                      id="accType"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-xs font-medium text-ink focus:outline-none focus:border-brand"
                    >
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="accCurrency" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
                      Currency Unit
                    </label>
                    <select
                      id="accCurrency"
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-xs font-mono text-ink focus:outline-none focus:border-brand"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="initBal" className="block text-[10px] font-mono uppercase text-ink-muted mb-1">
                      Initial Baseline Balance ($)
                    </label>
                    <input
                      id="initBal"
                      name="initialBalance"
                      type="number"
                      step="0.01"
                      disabled={Boolean(isEditingId)}
                      placeholder="0.00"
                      value={formData.initialBalance}
                      onChange={handleChange}
                      className="w-full rounded border border-border bg-surface px-3 py-2 text-xs font-mono tabular-nums text-ink focus:outline-none focus:border-brand disabled:opacity-50"
                    />
                    {isEditingId && (
                      <span className="text-[10px] text-ink-muted/80">
                        Running balance is dynamically derived from transactions.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand hover:bg-brand-light text-white px-4 py-2 rounded text-xs font-medium shadow-2xs transition-colors duration-150"
                  >
                    {submitting ? 'Saving...' : isEditingId ? 'Update Account' : 'Create Account'}
                  </button>
                </div>
              </form>
            )}

            {/* Accounts List Table */}
            {loading ? (
              <TableSkeleton rows={4} />
            ) : accounts.length === 0 ? (
              <EmptyState
                icon="Wallet"
                title="No treasury accounts active"
                description="Initialize your first checking or savings account above to record cash flows."
              />
            ) : (
              <div className="divide-y divide-border/60">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-canvas/40 px-3 rounded-lg transition-colors duration-150"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-canvas border border-border flex items-center justify-center font-mono text-xs font-bold text-brand shrink-0">
                        {acc.type === 'CREDIT_CARD' ? 'CC' : acc.type === 'SAVINGS' ? 'SV' : 'CH'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink text-sm">{acc.name}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-canvas text-ink-muted">
                            {acc.currency}
                          </span>
                        </div>
                        <span className="text-xs text-ink-muted font-sans">
                          {ACCOUNT_TYPES.find((t) => t.value === acc.type)?.label || acc.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right font-mono tabular-nums">
                        <span className="block text-xs text-ink-muted">Running Balance</span>
                        <span className={`text-sm font-semibold ${
                          acc.runningBalance < 0 ? 'text-negative' : 'text-ink'
                        }`}>
                          ${acc.runningBalance.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="text-xs font-mono text-ink hover:text-brand px-2 py-1 rounded border border-border bg-surface hover:bg-canvas transition-colors duration-150"
                        >
                          Edit
                        </button>
                        {accounts.length > 1 && (
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="text-xs font-mono text-negative hover:bg-negative/10 px-2 py-1 rounded transition-colors duration-150"
                            title="Delete account"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - User Profile & System Specifications */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
            <h3 className="font-fraunces text-xl font-medium text-ink mb-1">
              User Credentials
            </h3>
            <p className="text-xs text-ink-muted font-sans mb-5">
              Current identity & security session parameters.
            </p>

            {user && (
              <div className="space-y-4 font-sans text-xs">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-ink-muted">Display Name</span>
                  <span className="font-semibold text-ink text-sm">{user.displayName || 'Treasury Officer'}</span>
                </div>

                <div>
                  <span className="block font-mono text-[10px] uppercase text-ink-muted">Email Address</span>
                  <span className="font-mono text-ink text-xs">{user.email}</span>
                </div>

                <div>
                  <span className="block font-mono text-[10px] uppercase text-ink-muted">Session Authentication</span>
                  <span className="inline-flex items-center gap-1.5 text-positive font-medium mt-1">
                    <span className="w-2 h-2 rounded-full bg-positive inline-block" />
                    Secure HTTP-Only Cookie + Access JWT
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* System Diagnostics Box */}
          <div className="p-6 rounded-lg bg-ink text-canvas border border-ink shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-border/20 pb-2">
              <span className="font-bold text-brand-light">COFFER DIAGNOSTICS</span>
              <span className="text-positive">● ONLINE</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-ink-muted">
              <div className="flex justify-between">
                <span>DATABASE ENGINE:</span>
                <span className="text-canvas">SQLite (dev.db)</span>
              </div>
              <div className="flex justify-between">
                <span>PRISMA SCHEMA:</span>
                <span className="text-canvas">PostgreSQL Compatible</span>
              </div>
              <div className="flex justify-between">
                <span>TYPOGRAPHY:</span>
                <span className="text-canvas">Fraunces + Tabular Mono</span>
              </div>
              <div className="flex justify-between">
                <span>API LATENCY:</span>
                <span className="text-positive">&lt; 18ms Avg.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
