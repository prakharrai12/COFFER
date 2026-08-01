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

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { label: 'One special symbol (!@#$...)', met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-1.5 mb-4 space-y-2">
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
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-mono text-ink-muted uppercase tracking-wider">
          Security Level
        </span>
        <span
          className={`text-[10px] font-mono font-semibold uppercase tracking-wider ${
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

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center gap-1 text-[10px] font-sans">
            <span className={req.met ? 'text-positive font-bold' : 'text-ink-muted/50'}>
              {req.met ? '✓' : '○'}
            </span>
            <span className={req.met ? 'text-ink font-medium' : 'text-ink-muted'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
