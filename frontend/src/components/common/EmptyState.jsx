import React from 'react';

const renderIconGraphic = (icon) => {
  switch (icon) {
    case 'Search':
      return '🔍';
    case 'Chart':
      return '📊';
    case 'Filter':
      return '⚡';
    case 'Vault':
    default:
      return '🏦';
  }
};

const EmptyState = ({
  icon = 'Vault',
  title = 'No records in ledger',
  description = 'Your ledger is currently clean for this reporting period. Initialize an entry to begin tracking precision cash flow.',
  actionLabel,
  onAction,
  actionVariant = 'brand',
}) => {
  return (
    <div className="py-16 px-6 rounded-xl border border-border border-dashed bg-surface/50 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8 transition-colors">
      <div className="w-12 h-12 rounded-2xl bg-canvas border border-border/80 flex items-center justify-center font-mono text-lg mb-4 shadow-sm select-none">
        {renderIconGraphic(icon)}
      </div>
      <h3 className="font-fraunces text-xl font-medium text-ink mb-2">
        {title}
      </h3>
      <p className="text-sm text-ink-muted leading-relaxed font-sans max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`font-medium py-2.5 px-5 rounded-lg text-xs shadow-sm transition-all duration-200 flex items-center gap-2 font-sans ${
            actionVariant === 'brand'
              ? 'bg-brand hover:bg-brand-light text-white'
              : 'bg-surface hover:bg-canvas text-ink border border-border'
          }`}
        >
          <span>+ {actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;

