import React, { useState, useEffect } from 'react';
import api from '../services/api.js';
import AppLayout from '../components/layout/AppLayout.jsx';
import { BudgetBarSkeleton } from '../components/common/Skeletons.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import CategoryDeleteModal from '../components/categories/CategoryDeleteModal.jsx';

const COLOR_PRESETS = [
  '#1F5F4D', '#3FA37F', '#B8863B', '#D3A55C',
  '#2E8B57', '#4CC38A', '#B0452F', '#E27158',
  '#3D5A80', '#98C1D9', '#EE6C4D', '#293241',
];

const BudgetsAndCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [month, setMonth] = useState(() => new Date().toISOString().slice(0, 7));

  // Category creation state
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#1F5F4D');
  const [catError, setCatError] = useState('');

  // Budget editing state
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [limitInput, setLimitInput] = useState('');
  const [budgetError, setBudgetError] = useState('');

  // Safe delete modal
  const [selectedCatForDelete, setSelectedCatForDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, budgetRes] = await Promise.all([
        api.get('/categories'),
        api.get(`/budgets?month=${month}`),
      ]);
      setCategories(catRes.categories || []);
      setBudgets(budgetRes.budgets || []);
    } catch (err) {
      console.error('Error fetching budgets/categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [month]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setCatError('Category name cannot be empty.');
      return;
    }
    setCatError('');
    try {
      await api.post('/categories', { name: newCatName.trim(), color: newCatColor });
      setNewCatName('');
      fetchData();
    } catch (err) {
      setCatError(err.message || 'Failed to create category.');
    }
  };

  const handleSaveBudget = async (categoryId) => {
    const num = parseFloat(limitInput);
    if (isNaN(num) || num < 0) {
      setBudgetError('Please enter a valid positive dollar amount.');
      return;
    }
    setBudgetError('');
    try {
      await api.post('/budgets', { categoryId, monthlyLimit: num, month });
      setEditingBudgetId(null);
      fetchData();
    } catch (err) {
      setBudgetError(err.message || 'Failed to save budget limit.');
    }
  };

  const handleRemoveBudget = async (budgetId) => {
    if (!budgetId) return;
    try {
      await api.delete(`/budgets/${budgetId}`);
      fetchData();
    } catch (err) {
      console.error('Failed to remove budget:', err);
    }
  };

  return (
    <AppLayout>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-fraunces text-3xl font-medium tracking-tight text-ink">
            Budgets & Category Vaults
          </h1>
          <p className="text-sm text-ink-muted font-sans">
            Configure monthly expenditure limits and customize visual category tags for precision grouping.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="budgetMonth" className="text-xs font-mono uppercase text-ink-muted">
            Budget Period:
          </label>
          <input
            id="budgetMonth"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-surface border border-border rounded-md px-3 py-1.5 text-xs font-mono text-ink focus:outline-none focus:border-brand shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - Monthly Category Budgets */}
        <div className="col-span-1 lg:col-span-7 space-y-6">
          <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
            <h3 className="font-fraunces text-xl font-medium text-ink mb-1">
              Active Monthly Limits ({month})
            </h3>
            <p className="text-xs text-ink-muted font-sans mb-6">
              Track spending against custom financial caps. Bars transition from safe green to warning amber and alert crimson.
            </p>

            {budgetError && (
              <div className="p-3 mb-4 rounded bg-negative/10 border border-negative/30 text-negative text-xs">
                {budgetError}
              </div>
            )}

            {loading ? (
              <BudgetBarSkeleton count={5} />
            ) : budgets.length === 0 ? (
              <EmptyState
                icon="Target"
                title="No categories to budget"
                description="Create your first category tag on the right panel to establish financial limits."
              />
            ) : (
              <div className="space-y-6 divide-y divide-border/40">
                {budgets.map((b) => {
                  const hasBudget = b.monthlyLimit !== null;
                  const isEditing = editingBudgetId === b.categoryId;

                  const barBg = b.status === 'danger'
                    ? 'bg-negative'
                    : b.status === 'warning'
                    ? 'bg-warning'
                    : 'bg-brand';

                  const percentClamped = Math.min(b.percentage, 100);

                  return (
                    <div key={b.categoryId} className="pt-4 first:pt-0 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: b.categoryColor }} />
                          <span className="font-semibold text-ink text-sm">{b.categoryName}</span>
                          {hasBudget && (
                            <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              b.status === 'danger'
                                ? 'bg-negative/10 text-negative font-bold'
                                : b.status === 'warning'
                                ? 'bg-warning/10 text-warning font-semibold'
                                : 'bg-positive/10 text-positive font-medium'
                            }`}>
                              {b.status === 'danger' ? 'Over Limit' : b.status === 'warning' ? 'Near Limit' : 'On Track'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {hasBudget && !isEditing && (
                            <div className="font-mono tabular-nums text-xs text-ink-muted">
                              <span className={b.status === 'danger' ? 'text-negative font-bold' : 'text-ink font-medium'}>
                                ${b.spent.toFixed(2)}
                              </span>
                              {' / '}
                              <span>${b.monthlyLimit.toFixed(2)}</span>
                              <span className="ml-1 opacity-75">({b.percentage}%)</span>
                            </div>
                          )}

                          {!isEditing ? (
                            <button
                              onClick={() => {
                                setEditingBudgetId(b.categoryId);
                                setLimitInput(hasBudget ? String(b.monthlyLimit) : '300');
                                setBudgetError('');
                              }}
                              className="text-xs font-medium text-brand hover:underline"
                            >
                              {hasBudget ? 'Edit Limit' : '+ Set Budget'}
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="1"
                                placeholder="Limit ($)"
                                value={limitInput}
                                onChange={(e) => setLimitInput(e.target.value)}
                                className="w-24 rounded border border-border bg-canvas px-2 py-1 text-xs font-mono text-ink focus:outline-none focus:border-brand"
                                autoFocus
                              />
                              <button
                                onClick={() => handleSaveBudget(b.categoryId)}
                                className="bg-brand hover:bg-brand-light text-white px-2.5 py-1 rounded text-xs font-medium"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingBudgetId(null)}
                                className="text-ink-muted hover:text-ink px-2 py-1 text-xs"
                              >
                                Cancel
                              </button>
                            </div>
                          )}

                          {hasBudget && !isEditing && (
                            <button
                              onClick={() => handleRemoveBudget(b.id)}
                              className="text-ink-muted hover:text-negative text-xs font-mono"
                              title="Clear budget target"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {hasBudget && (
                        <div className="h-2.5 w-full rounded-full bg-canvas border border-border/60 overflow-hidden shadow-2xs">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ease-out ${barBg}`}
                            style={{ width: `${percentClamped}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Category Management */}
        <div className="col-span-1 lg:col-span-5 space-y-6">
          <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
            <h3 className="font-fraunces text-xl font-medium text-ink mb-1">
              Create New Category Tag
            </h3>
            <p className="text-xs text-ink-muted font-sans mb-5">
              Add distinct visual groupings for transactions.
            </p>

            {catError && (
              <div className="p-3 mb-4 rounded bg-negative/10 border border-negative/30 text-negative text-xs">
                {catError}
              </div>
            )}

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label htmlFor="catName" className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                  Category Name
                </label>
                <input
                  id="catName"
                  type="text"
                  placeholder="e.g., Subscriptions or Dining Out"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-canvas px-3 py-2 text-xs text-ink focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
                  Preset Color Token
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCatColor(color)}
                      className={`h-7 rounded-md transition-all duration-150 flex items-center justify-center ${
                        newCatColor === color ? 'ring-2 ring-ink ring-offset-2 scale-105' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {newCatColor === color && <span className="text-white text-xs font-bold">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-light text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors duration-150 shadow-2xs"
              >
                + Add Category Tag
              </button>
            </form>
          </div>

          <div className="p-6 rounded-lg bg-surface border border-border shadow-2xs">
            <h3 className="font-fraunces text-lg font-medium text-ink mb-4">
              Registered Categories ({categories.length})
            </h3>
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 divide-y divide-border/30">
              {categories.map((cat) => (
                <div key={cat.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="font-medium text-ink">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => setSelectedCatForDelete(cat)}
                    className="text-ink-muted hover:text-negative text-xs font-mono transition-colors duration-150"
                    title="Delete category"
                  >
                    Delete / Reassign
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete / Safe Reassign Modal */}
      <CategoryDeleteModal
        isOpen={Boolean(selectedCatForDelete)}
        onClose={() => setSelectedCatForDelete(null)}
        category={selectedCatForDelete}
        categories={categories}
        onDeleted={fetchData}
      />
    </AppLayout>
  );
};

export default BudgetsAndCategories;
