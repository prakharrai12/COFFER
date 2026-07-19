import React from 'react';

const EmptyState = ({
  icon = 'Vault',
  title = 'No records in ledger',
  description = 'Your ledger is currently clean for this reporting period. Initialize an entry to begin tracking precision cash flow.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="py-16 px-6 rounded-lg border border-border border-dashed bg-surface/50 text-center flex flex-col items-center justify-center max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-full bg-canvas border border-border flex items-center justify-center font-mono font-bold text-ink-muted text-base mb-4 shadow-sm">
        {icon === 'Vault' ? 'V' : icon}
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
          className="bg-brand hover:bg-brand-light text-white font-medium py-2.5 px-5 rounded-lg text-sm shadow-sm transition-all duration-200 flex items-center gap-2 font-sans"
        >
          <span>+ {actionLabel}</span>
        </button>
      )}
    </div>
  );
};

export default EmptyState;
