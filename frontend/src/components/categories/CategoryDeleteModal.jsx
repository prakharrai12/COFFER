import React, { useState } from 'react';
import api from '../../services/api.js';

const CategoryDeleteModal = ({ isOpen, onClose, category, categories = [], onDeleted }) => {
  const [reassignId, setReassignId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !category) return null;

  const alternativeCategories = categories.filter((c) => c.id !== category.id);

  const handleDelete = async () => {
    setSubmitting(true);
    setError('');

    try {
      if (reassignId) {
        await api.post(`/categories/${category.id}/safe-delete`, {
          reassignCategoryId: reassignId,
        });
      } else {
        await api.delete(`/categories/${category.id}`);
      }
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete category. Try specifying a reassignment target.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-md rounded-xl bg-surface border border-border shadow-2xl p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-negative/10 text-negative flex items-center justify-center font-bold text-lg shrink-0">
            !
          </div>
          <div>
            <h3 className="font-fraunces text-xl font-medium text-ink">
              Delete "{category.name}"?
            </h3>
            <p className="text-xs text-ink-muted font-sans">
              Safe deletion and ledger history preservation
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded bg-negative/10 border border-negative/30 text-negative text-xs">
            {error}
          </div>
        )}

        <p className="text-sm text-ink font-sans leading-relaxed">
          Deleting a category permanently removes its visual tag. If you have logged transactions or historical records under <strong className="text-ink">{category.name}</strong>, select an alternative category below to safely transfer them before removal:
        </p>

        <div>
          <label className="block text-xs font-mono uppercase text-ink-muted mb-1.5">
            Reassign existing transactions to:
          </label>
          <select
            value={reassignId}
            onChange={(e) => setReassignId(e.target.value)}
            className="w-full rounded-lg border border-border bg-canvas px-3 py-2.5 text-xs font-medium text-ink focus:outline-none focus:border-brand transition-colors duration-150"
          >
            <option value="">Do not reassign (Delete transactions / Cascade)</option>
            {alternativeCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="text-xs font-medium text-ink-muted hover:text-ink px-4 py-2.5 rounded border border-border bg-surface transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={submitting}
            className="text-xs font-medium text-white bg-negative hover:bg-negative/90 px-4 py-2.5 rounded shadow-xs transition-colors duration-150 flex items-center gap-2"
          >
            {submitting ? 'Deleting...' : reassignId ? 'Reassign & Delete' : 'Delete Category'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryDeleteModal;
