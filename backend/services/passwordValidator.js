/**
 * Validates password strength and criteria according to COFFER security standards.
 * @param {string} password 
 * @returns {{ isValid: boolean, score: number, errors: string[], checks: { length: boolean, uppercase: boolean, lowercase: boolean, number: boolean, special: boolean } }}
 */
export const validatePasswordPolicy = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      score: 0,
      errors: ['Password must be a non-empty string.'],
      checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
    };
  }

  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const errors = [];
  if (!checks.length) errors.push('Password must be at least 8 characters long.');
  if (!checks.uppercase) errors.push('Password must contain at least one uppercase letter.');
  if (!checks.lowercase) errors.push('Password must contain at least one lowercase letter.');
  if (!checks.number) errors.push('Password must contain at least one number.');
  if (!checks.special) errors.push('Password must contain at least one special character (!@#$%^&*).');

  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedCount / 5) * 100);

  return {
    isValid: errors.length === 0,
    score,
    errors,
    checks,
  };
};
