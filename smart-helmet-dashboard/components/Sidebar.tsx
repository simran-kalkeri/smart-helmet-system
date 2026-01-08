"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  Settings,
  User,
  Shield,
  BarChart,
  Sun,
  Moon
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "#3b82f6" },
  { name: "My Profile", href: "/profile", icon: User, color: "#8b5cf6" },
  { name: "Live Map", href: "/map", icon: Map, color: "#14b8a6" },
  { name: "My Alerts", href: "/alerts", icon: AlertTriangle, color: "#ef4444" },
  { name: "Analytics", href: "/analytics", icon: BarChart, color: "#a855f7" },
  { name: "Settings", href: "/settings", icon: Settings, color: "#6366f1" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light';
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="logo">
        <div className="logo-icon">
          <Shield size={24} />
        </div>
        <span>Smart Helmet</span>
      </div>

      {/* Navigation */}
      <nav className="nav">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div
                className="icon-box"
                style={{
                  background: isActive ? item.color : `${item.color}15`,
                  boxShadow: isActive ? `0 0 20px ${item.color}50` : 'none'
                }}
              >
                <item.icon size={20} style={{ color: isActive ? 'white' : item.color }} />
              </div>
              <span>{item.name}</span>
              {isActive && <div className="glow-bar" style={{ background: item.color, boxShadow: `0 0 12px ${item.color}` }} />}
            </Link>
          );
        })}
      </nav>

      {/* Theme Toggle */}
      <div className="footer">
        <button className="theme-btn" onClick={toggleTheme}>
          <div className="icon-box theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </div>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <div className="status">
          <div className="status-dot" />
          <span>System Online</span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          background: var(--sidebar-bg);
          border-right: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          padding: 20px 14px;
          z-index: 50;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          margin-bottom: 28px;
          font-weight: 600;
          font-size: 1.1rem;
          color: var(--foreground);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: 14px;
        }

        .logo-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #3b82f6, #7c3aed);
          border-radius: 12px;
          color: white;
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        }

        .nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .nav-item {
          position: relative;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          color: var(--foreground);
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .nav-item:hover {
          background: rgba(59, 130, 246, 0.08);
          transform: translateX(4px);
        }

        .nav-item:hover .icon-box {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
        }

        .icon-box {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .glow-bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 3px;
          height: 100%;
          border-radius: 0 4px 4px 0;
        }

        .footer {
          padding-top: 16px;
          border-top: 1px solid var(--card-border);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .theme-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 12px 14px;
          background: transparent;
          border: none;
          border-radius: 12px;
          color: var(--foreground);
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .theme-btn:hover {
          background: rgba(59, 130, 246, 0.08);
        }

        .icon-box.theme {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 10px;
          font-size: 0.85rem;
          color: var(--foreground-muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
          box-shadow: 0 0 10px #22c55e;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.2); }
        }
      `}</style>
    </aside>
  );
}
