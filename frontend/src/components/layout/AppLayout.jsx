import React from 'react';
import Navbar from './Navbar.jsx';

const AppLayout = ({ children }) => {
  return (
    <div className="relative min-h-screen text-ink flex flex-col font-sans selection:bg-brand selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>
      
      <footer className="border-t border-white/10 bg-surface/40 backdrop-blur-xl py-6 mt-16 text-center text-xs text-ink-muted font-mono relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-positive animate-pulse" />
            <span>COFFER VAULT LEDGER v2.5 • AGGREGATION ENGINE</span>
          </div>
          <span className="opacity-80">PRECISION CASHFLOW INTELLIGENCE & GLASS TELEMETRY</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
