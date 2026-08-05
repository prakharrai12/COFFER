import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [, setError] = useState('');

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

  // Password Change state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: '', text: '' });

    if (!pwdForm.currentPassword || !pwdForm.newPassword || !pwdForm.confirmPassword) {
      setPwdMessage({ type: 'error', text: 'All password fields are required.' });
      return;
    }

    if (pwdForm.newPassword.length < 8) {
      setPwdMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMessage({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setPwdSubmitting(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMessage({ type: 'success', text: 'Password changed successfully!' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      setPwdMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setPwdSubmitting(false);
    }
  };

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

  const handleExportJSON = async () => {
    try {
      const [accRes, catRes, txRes] = await Promise.all([
        api.get('/accounts'),
        api.get('/categories'),
        api.get('/transactions?limit=1000'),
      ]);
      const backupData = {
        exportDate: new Date().toISOString(),
        userEmail: user?.email,
        accounts: accRes.accounts || [],
        categories: catRes.categories || [],
        transactions: txRes.transactions || [],
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `coffer-backup-${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export data: ' + err.message);
    }
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl sm:text-4xl font-medium tracking-tight text-white drop-shadow-sm">
          Treasury & Workspace Settings
        </h1>
        <p className="text-sm text-ink-muted font-sans mt-1">
          Manage multi-currency financial accounts, modify initial balances, and configure workspace defaults.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Accounts Manager */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          <div className="p-6 rounded-2xl glass-surface border border-white/10 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-fraunces text-xl font-medium text-white">
                  Registered Treasury Accounts ({accounts.length})
                </h3>
                <p className="text-xs text-ink-muted font-sans">
                  Each account maintains its own independent running balance and currency token.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleOpenCreate}
                className="glass-btn text-white text-xs font-medium px-4 py-2 rounded-xl shadow-md"
              >
                + New Account
              </motion.button>
            </div>

            {/* Account Form / Editor Panel */}
            {(isEditingId !== null || formData.name !== '' || accounts.length === 0) && (
              <form onSubmit={handleSaveAccount} className="p-5 rounded-xl bg-white/5 border border-white/15 mb-6 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-fraunces text-base font-medium text-white">
                    {isEditingId ? 'Modify Treasury Account' : 'Initialize New Account'}
                  </span>
                  {isEditingId && (
                    <button
                      type="button"
                      onClick={handleOpenCreate}
                      className="text-xs font-mono text-ink-muted hover:text-white"
                    >
                      Cancel Edit ✕
                    </button>
                  )}
                </div>

                {formError && (
                  <div className="p-3 rounded-lg bg-negative/20 border border-negative/40 text-negative text-xs">
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
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-light"
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
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs font-medium text-white focus:outline-none focus:border-brand-light"
                    >
                      {ACCOUNT_TYPES.map((t) => (
                        <option key={t.value} value={t.value} className="bg-slate-900 text-white">{t.label}</option>
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
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-brand-light"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
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
                      className="w-full rounded-xl border border-white/15 bg-black/40 px-3.5 py-2 text-xs font-mono tabular-nums text-white focus:outline-none focus:border-brand-light disabled:opacity-50"
                    />
                    {isEditingId && (
                      <span className="text-[10px] text-ink-muted/80 mt-1 block">
                        Running balance is dynamically derived from transactions.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                    className="glass-btn text-white px-5 py-2.5 rounded-xl text-xs font-medium shadow-md"
                  >
                    {submitting ? 'Saving...' : isEditingId ? 'Update Account' : 'Create Account'}
                  </motion.button>
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
              <div className="divide-y divide-white/10">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="py-4 flex items-center justify-between gap-4 hover:bg-white/5 px-3 rounded-xl transition-all duration-150"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand/30 to-brand-light/20 border border-brand-light/30 flex items-center justify-center font-mono text-xs font-bold text-brand-light shrink-0 shadow-sm">
                        {acc.type === 'CREDIT_CARD' ? 'CC' : acc.type === 'SAVINGS' ? 'SV' : 'CH'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">{acc.name}</span>
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-brand-light">
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
                        <span className="block text-[10px] uppercase text-ink-muted">Running Balance</span>
                        <span className={`text-base font-semibold ${
                          acc.runningBalance < 0 ? 'text-negative' : 'text-white'
                        }`}>
                          ${acc.runningBalance.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(acc)}
                          className="text-xs font-mono text-white hover:text-brand-light px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 transition-all"
                        >
                          Edit
                        </button>
                        {accounts.length > 1 && (
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.name)}
                            className="text-xs font-mono text-negative hover:bg-negative/20 px-2.5 py-1.5 rounded-lg border border-negative/30 transition-all"
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

        {/* Right Column - User Credentials & System Diagnostics */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl glass-surface border border-white/10 shadow-xl">
            <h3 className="font-fraunces text-xl font-medium text-white mb-1">
              User Credentials
            </h3>
            <p className="text-xs text-ink-muted font-sans mb-5">
              Current identity & security session parameters.
            </p>

            {user && (
              <div className="space-y-4 font-sans text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="block font-mono text-[10px] uppercase text-ink-muted mb-0.5">Display Name</span>
                  <span className="font-semibold text-white text-sm">{user.displayName || 'Treasury Officer'}</span>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="block font-mono text-[10px] uppercase text-ink-muted mb-0.5">Email Address</span>
                  <span className="font-mono text-white text-xs">{user.email}</span>
                </div>

                <div>
                  <span className="block font-mono text-[10px] uppercase text-ink-muted mb-2">Data Portability</span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleExportJSON}
                    className="w-full glass-btn-secondary font-medium py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 mb-4"
                  >
                    <span>💾 Export Complete Ledger JSON</span>
                  </motion.button>
                </div>

                {/* Change Password Section */}
                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-fraunces text-base font-medium text-white mb-1">
                    Security & Passphrase
                  </h4>
                  <p className="text-[11px] text-ink-muted mb-3">
                    Rotate your authentication key to protect financial records.
                  </p>

                  {showChangePassword ? (
                    <form onSubmit={handleChangePasswordSubmit} className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/15">
                      {pwdMessage.text && (
                        <div className={`p-2.5 rounded-lg text-xs ${
                          pwdMessage.type === 'error' ? 'bg-negative/20 border border-negative/40 text-negative' : 'bg-positive/20 border border-positive/40 text-positive'
                        }`}>
                          {pwdMessage.text}
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-ink-muted mb-1">Current Password</label>
                        <input
                          type="password"
                          required
                          value={pwdForm.currentPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-ink-muted mb-1">New Passphrase</label>
                        <input
                          type="password"
                          required
                          value={pwdForm.newPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-light"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono uppercase text-ink-muted mb-1">Confirm New Passphrase</label>
                        <input
                          type="password"
                          required
                          value={pwdForm.confirmPassword}
                          onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                          className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-light"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => { setShowChangePassword(false); setPwdMessage({ type: '', text: '' }); }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-white/15 text-ink-muted hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={pwdSubmitting}
                          className="text-xs px-3.5 py-1.5 rounded-lg bg-brand text-white font-medium hover:bg-brand-light disabled:opacity-50"
                        >
                          {pwdSubmitting ? 'Updating...' : 'Update Passphrase'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowChangePassword(true)}
                      className="w-full glass-btn-secondary font-medium py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <span>🔒 Change Vault Password</span>
                    </motion.button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* System Diagnostics Box */}
          <div className="p-6 rounded-2xl glass-card text-white border border-white/15 shadow-xl space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="font-bold text-brand-light flex items-center gap-2">
                <span>COFFER DIAGNOSTICS</span>
              </span>
              <span className="text-positive flex items-center gap-1.5 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="space-y-1.5 text-[11px] opacity-80">
              <p>Core Engine: v2.5.0-glass</p>
              <p>Deployment: Vercel Edge / Serverless</p>
              <p>Database: SQLite / Prisma ORM</p>
              <p>Active Session ID: {user?.id ? user.id.slice(0, 8) : 'demo-session'}...</p>
            </div>
            <div className="space-y-2 text-[11px] text-ink-muted border-t border-white/10 pt-3">
              <div className="flex justify-between">
                <span>DATABASE ENGINE:</span>
                <span className="text-white">SQLite (dev.db)</span>
              </div>
              <div className="flex justify-between">
                <span>PRISMA SCHEMA:</span>
                <span className="text-white">PostgreSQL Compatible</span>
              </div>
              <div className="flex justify-between">
                <span>TYPOGRAPHY:</span>
                <span className="text-white">Fraunces + Tabular Mono</span>
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
