"use client";

import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="header glass-panel">
      <div className="header-title">
        <h1>Smart Helmet Dashboard</h1>
      </div>

      <div className="header-actions">
        <ThemeToggle />
      </div>

      <style jsx>{`
        .header {
          height: var(--header-height);
          position: fixed;
          top: 0;
          left: var(--sidebar-width);
          right: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 32px;
          z-index: 40;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-right: none;
          background: var(--card-bg);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--card-border);
        }

        .header-title h1 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--foreground);
        }

        .header-actions {
          display: flex;
          align-items: center;
        }
      `}</style>
    </header>
  );
}
