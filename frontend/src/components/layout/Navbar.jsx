import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Command Center', path: '/' },
    { name: 'Ledger', path: '/transactions' },
    { name: 'Budgets & Vaults', path: '/budgets' },
    { name: 'Analytics', path: '/reports' },
    { name: 'Settings', path: '/settings' },
  ];

  return (
    <header className="border-b border-border bg-surface/90 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded bg-brand group-hover:bg-brand-light transition-colors duration-200 flex items-center justify-center font-mono font-bold text-xs text-white shadow-sm">
              C
            </div>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-ink">
              COFFER
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium font-sans transition-all duration-150 ${
                    isActive
                      ? 'bg-canvas text-ink font-semibold shadow-2xs'
                      : 'text-ink-muted hover:text-ink hover:bg-canvas/50'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 text-xs border-r border-border pr-4 py-1">
              <span className="w-2 h-2 rounded-full bg-positive inline-block" />
              <span className="font-medium text-ink">{user.displayName || user.email.split('@')[0]}</span>
              <span className="font-mono text-[10px] bg-canvas px-1.5 py-0.5 rounded text-ink-muted">
                {user.currency || '$ USD'}
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="text-xs font-medium text-ink-muted hover:text-negative transition-colors duration-200 py-1.5 px-2.5 rounded hover:bg-negative/5"
            title="Sign out of workspace"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-border/60 bg-surface px-4 py-2 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-2.5 py-1 rounded text-[11px] font-medium whitespace-nowrap transition-colors duration-150 ${
                isActive ? 'bg-canvas text-ink font-semibold' : 'text-ink-muted'
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </div>
    </header>
  );
};

export default Navbar;
