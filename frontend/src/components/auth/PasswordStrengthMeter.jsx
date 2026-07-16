import React from 'react';

const PasswordStrengthMeter = ({ password = '' }) => {
  const checkStrength = (pwd) => {
    let score = 0;
    if (!pwd) return { score: 0, label: '', colorClass: '' };
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', colorClass: 'bg-negative' };
    if (score === 2) return { score: 2, label: 'Fair', colorClass: 'bg-warning' };
    if (score === 3) return { score: 3, label: 'Good', colorClass: 'bg-brand-light' };
    return { score: 4, label: 'Strong', colorClass: 'bg-positive' };
  };

  const { score, label, colorClass } = checkStrength(password);

  if (!password) return null;

  return (
    <div className="mt-1 mb-4">
      <div className="flex gap-1.5 h-1.5 w-full">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`flex-1 rounded-full transition-all duration-300 ${
              level <= score ? colorClass : 'bg-border'
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-[11px] font-medium text-ink-muted uppercase tracking-wider">
          Password Strength
        </span>
        <span
          className={`text-[11px] font-semibold uppercase tracking-wider ${
            score <= 1
              ? 'text-negative'
              : score === 2
              ? 'text-warning'
              : 'text-positive'
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
