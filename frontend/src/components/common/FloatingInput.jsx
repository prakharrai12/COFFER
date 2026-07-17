import React, { useState } from 'react';

const FloatingInput = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  name,
  required = false,
  placeholder = '',
  disabled = false,
  className = '',
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  const isFloating = isFocused || hasValue;

  return (
    <div className={`relative mb-4 ${className}`}>
      <div
        className={`relative rounded-lg border transition-all duration-200 bg-surface px-3.5 pt-5 pb-2 min-h-[52px] flex flex-col justify-end ${
          error
            ? 'border-negative focus-within:ring-2 focus-within:ring-negative/20'
            : isFocused
            ? 'border-brand ring-2 ring-brand/15 shadow-sm'
            : 'border-border hover:border-ink-muted/80'
        }`}
      >
        <label
          htmlFor={name}
          className={`absolute left-3 transition-all duration-200 pointer-events-none ${
            isFloating
              ? 'top-1.5 text-[11px] font-medium tracking-wider uppercase text-ink-muted'
              : 'top-3.5 text-sm text-ink-muted'
          } ${error ? 'text-negative' : isFocused ? 'text-brand' : ''}`}
        >
          {label} {required && <span className="text-negative">*</span>}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={isFocused ? placeholder : ''}
          className="w-full bg-transparent text-ink text-sm font-sans focus:outline-none placeholder:text-ink-muted/40 disabled:opacity-50 tabular-nums"
          {...rest}
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-negative font-medium transition-all duration-200 flex items-center gap-1">
          <span>•</span> {error}
        </p>
      )}
    </div>
  );
};

export default FloatingInput;
