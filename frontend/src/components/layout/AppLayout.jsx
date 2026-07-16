import React from 'react';
import Navbar from './Navbar.jsx';

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-border/60 bg-surface/50 py-6 mt-16 text-center text-xs text-ink-muted font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between gap-2">
          <span>COFFER TREASURY LEDGER v1.0 • PRECISION AGGREGATION ENGINE</span>
          <span>BUILT WITH SUB-3 SECOND AGGREGATION & TABULAR NUMERALS</span>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
