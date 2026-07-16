import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';

const TransactionModal = ({
  isOpen,
  onClose,
  onSaved,
  transaction = null, // null for create, object for edit
  accounts = [],
  categories = [],
}) => {
  const isEdit = Boolean(transaction);

  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    accountId: '',
    categoryId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    note: '',
    isRecurring: false,
    recurringInterval: 'MONTHLY',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      setServerError('');

      if (transaction) {
        setFormData({
          type: transaction.type || 'EXPENSE',
          accountId: transaction.accountId || '',
          categoryId: transaction.categoryId || '',
          amount: transaction.amount ? String(transaction.amount) : '',
          date: transaction.date ? new Date(transaction.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
          note: transaction.note || '',
          isRecurring: Boolean(transaction.isRecurring),
          recurringInterval: transaction.recurringInterval || 'MONTHLY',
        });
      } else {
        setFormData({
          type: 'EXPENSE',
          accountId: accounts.length > 0 ? accounts[0].id : '',
          categoryId: categories.length > 0 ? categories[0].id : '',
          amount: '',
          date: new Date().toISOString().slice(0, 10),
          note: '',
          isRecurring: false,
          recurringInterval: 'MONTHLY',
        });
      }
    }
  }, [isOpen, transaction, accounts, categories]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.accountId) newErrors.accountId = 'Account is required.';
    if (!formData.categoryId) newErrors.categoryId = 'Category is required.';
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Valid positive amount is required.';
    }
    if (!formData.date) newErrors.date = 'Date is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError('');

    try {
      const payload = {
        type: formData.type,
        accountId: formData.accountId,
        categoryId: formData.categoryId,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        note: formData.note.trim(),
        isRecurring: formData.isRecurring,
        recurringInterval: formData.isRecurring ? formData.recurringInterval : null,
      };

      if (isEdit) {
        await api.put(`/transactions/${transaction.id}`, payload);
      } else {
        await api.post('/transactions', payload);
      }

      onSaved();
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to save transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you certain you wish to permanently delete this transaction record?')) return;
    setDeleting(true);
    try {
      await api.delete(`/transactions/${transaction.id}`);
      onSaved();
      onClose();
    } catch (err) {
      setServerError(err.message || 'Failed to delete transaction.');
    } finally {
      setDeleting(false);
    }
  };

  // Filter categories by type if desired, or show all
  const filteredCategories = categories.filter((c) => {
    if (formData.type === 'INCOME') return c.name.toLowerCase().includes('income') || c.name.toLowerCase().includes('salary') || true;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-lg rounded-xl bg-surface border border-border shadow-2xl overflow-hidden transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-canvas/50">
          <div>
            <h3 className="font-fraunces text-xl font-medium text-ink">
              {isEdit ? 'Edit Transaction Record' : 'Record New Transaction'}
            </h3>
            <p className="text-xs text-ink-muted font-sans">
              {isEdit ? 'Update ledger allocation details' : 'Log cash inflow or outflow to your active treasury'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors duration-150 p-1 rounded-md text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {serverError && (
            <div className="p-3.5 rounded-lg bg-negative/10 border border-negative/30 text-negative text-xs font-medium">
              {serverError}
            </div>
          )}

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-2">
              Transaction Flow Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-canvas border border-border">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'EXPENSE' }))}
                className={`py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                  formData.type === 'EXPENSE'
                    ? 'bg-ink text-canvas shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                — Expense (Outflow)
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: 'INCOME' }))}
                className={`py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                  formData.type === 'INCOME'
                    ? 'bg-positive text-white shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                + Income (Inflow)
              </button>
            </div>
          </div>

          {/* Amount & Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Amount ($) <span className="text-negative">*</span>
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                className={`w-full rounded-lg border bg-surface px-3 py-2.5 text-sm font-mono tabular-nums text-ink focus:outline-none focus:border-brand transition-colors duration-200 ${
                  errors.amount ? 'border-negative' : 'border-border'
                }`}
              />
              {errors.amount && <p className="mt-1 text-[11px] text-negative">{errors.amount}</p>}
            </div>

            <div>
              <label htmlFor="date" className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Transaction Date <span className="text-negative">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-mono text-ink focus:outline-none focus:border-brand transition-colors duration-200"
              />
              {errors.date && <p className="mt-1 text-[11px] text-negative">{errors.date}</p>}
            </div>
          </div>

          {/* Account & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="accountId" className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Target Account <span className="text-negative">*</span>
              </label>
              <select
                id="accountId"
                name="accountId"
                value={formData.accountId}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-medium text-ink focus:outline-none focus:border-brand transition-colors duration-200"
              >
                <option value="" disabled>Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${acc.runningBalance.toFixed(2)})
                  </option>
                ))}
              </select>
              {errors.accountId && <p className="mt-1 text-[11px] text-negative">{errors.accountId}</p>}
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">
                Ledger Category <span className="text-negative">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-xs font-medium text-ink focus:outline-none focus:border-brand transition-colors duration-200"
              >
                <option value="" disabled>Select Category</option>
                {filteredCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-[11px] text-negative">{errors.categoryId}</p>}
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label htmlFor="note" className="block text-xs font-mono uppercase tracking-wider text-ink-muted mb-1.5">
              Description / Note
            </label>
            <input
              id="note"
              name="note"
              type="text"
              placeholder="e.g., Client Retainer Deposit or Whole Foods Groceries"
              value={formData.note}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-xs text-ink focus:outline-none focus:border-brand transition-colors duration-200"
            />
          </div>

          {/* Recurring Schedule Option */}
          <div className="p-3.5 rounded-lg bg-canvas/70 border border-border/80">
            <div className="flex items-center gap-2">
              <input
                id="isRecurring"
                name="isRecurring"
                type="checkbox"
                checked={formData.isRecurring}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border text-brand focus:ring-brand accent-brand"
              />
              <label htmlFor="isRecurring" className="text-xs font-medium text-ink select-none cursor-pointer">
                Schedule as auto-recurring periodic transaction
              </label>
            </div>

            {formData.isRecurring && (
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between gap-4">
                <span className="text-xs text-ink-muted font-mono">Repeat Frequency:</span>
                <select
                  name="recurringInterval"
                  value={formData.recurringInterval}
                  onChange={handleChange}
                  className="rounded border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink focus:outline-none focus:border-brand"
                >
                  <option value="WEEKLY">Weekly (Every 7 Days)</option>
                  <option value="MONTHLY">Monthly (Every 1 Month)</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-border flex items-center justify-between">
            {isEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="text-xs font-medium text-negative hover:text-negative/80 px-3 py-2 rounded border border-negative/30 hover:bg-negative/5 transition-colors duration-150"
              >
                {deleting ? 'Deleting...' : 'Delete Record'}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="text-xs font-medium text-ink-muted hover:text-ink px-4 py-2.5 rounded border border-border bg-surface hover:bg-canvas transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="text-xs font-medium text-white bg-brand hover:bg-brand-light px-5 py-2.5 rounded shadow-xs transition-colors duration-150 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{isEdit ? 'Update Transaction' : 'Save Transaction'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
