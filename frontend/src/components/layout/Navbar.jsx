import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { motion } from 'motion/react';
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
    <header className="border-b border-white/10 bg-surface/70 backdrop-blur-xl sticky top-0 z-40 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-light to-brand-dark flex items-center justify-center font-mono font-bold text-xs text-white shadow-[0_0_15px_rgba(63,163,127,0.4)] border border-white/20"
            >
              C
            </motion.div>
            <span className="font-mono text-xs font-semibold tracking-[0.2em] uppercase text-ink group-hover:text-brand-light transition-colors">
              COFFER VAULT
            </span>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full border border-white/15 text-[10px] font-mono text-ink-muted bg-white/5 backdrop-blur-md ml-1">
              ⌘K
            </span>
          </Link>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative px-3.5 py-1.5 rounded-lg text-xs font-medium font-sans transition-all duration-200 ${
                    isActive
                      ? 'text-white font-semibold shadow-sm'
                      : 'text-ink-muted hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.div
                        layoutId="activeTabPill"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-brand-dark to-brand-light border border-white/20 shadow-[0_0_12px_rgba(63,163,127,0.3)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Info & Interactive Actions */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-3 text-xs border-r border-white/10 pr-4 py-1">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand/30 to-brand-light/40 border border-brand-light/50 text-white flex items-center justify-center font-mono font-bold text-xs shadow-[0_0_10px_rgba(63,163,127,0.3)]"
              >
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </motion.div>
              <div className="flex flex-col">
                <span className="font-medium text-ink leading-tight">{user.displayName || user.email.split('@')[0]}</span>
                <span className="font-mono text-[10px] text-brand-light leading-tight">
                  {user.currency || '$ USD'}
                </span>
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={logout}
            className="text-xs font-medium text-ink-muted hover:text-negative transition-colors duration-200 py-1.5 px-3 rounded-lg border border-white/10 hover:border-negative/40 hover:bg-negative/10 backdrop-blur-md"
            title="Sign out of workspace"
          >
            Sign Out
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden border-t border-white/10 bg-surface/80 backdrop-blur-xl px-4 py-2 flex items-center justify-around overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all duration-150 ${
                isActive ? 'bg-brand/30 border border-brand/40 text-white font-semibold' : 'text-ink-muted'
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
