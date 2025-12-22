"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  AlertTriangle,
  History,
  Settings,
  Bell,
  User,
  Shield
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, color: "#3b82f6" },
  { name: "My Profile", href: "/profile", icon: User, color: "#8b5cf6" },
  { name: "Live Map", href: "/map", icon: Map, color: "#10b981" },
  { name: "My Alerts", href: "/alerts", icon: AlertTriangle, color: "#ef4444" },
  { name: "Event History", href: "/history", icon: History, color: "#f59e0b" },
  { name: "Notifications", href: "/notifications", icon: Bell, color: "#ec4899" },
  { name: "Settings", href: "/settings", icon: Settings, color: "#6366f1" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <Shield size={32} strokeWidth={2.5} />
        </div>
        <div className="logo-text">
          <h2>Smart Helmet</h2>
          <span className="badge">User Dashboard</span>
        </div>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
            >
              <div className="icon-wrapper" style={{
                background: isActive
                  ? `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`
                  : `${item.color}15`
              }}>
                <item.icon size={20} style={{ color: isActive ? 'white' : item.color }} />
              </div>
              <span className="nav-label">{item.name}</span>
              {isActive && (
                <div className="active-bar" style={{ background: item.color }} />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="status-card">
          <div className="status-indicator">
            <div className="status-dot online" />
            <span>System Online</span>
          </div>
          <div className="version">v2.0.1</div>
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
          padding: 20px 12px;
          z-index: 50;
          overflow-y: auto;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%);
          border-radius: 16px;
          border: 1px solid rgba(59, 130, 246, 0.3);
          position: relative;
          overflow: hidden;
        }

        .logo-container::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%);
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
          border-radius: 14px;
          color: white;
          box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
          position: relative;
          z-index: 1;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
          position: relative;
          z-index: 1;
        }

        .logo-text h2 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--foreground);
          margin: 0;
          line-height: 1.2;
        }

        .badge {
          background: linear-gradient(135deg, #3b82f6 0%, #7c3aed 100%);
          color: white;
          padding: 3px 10px;
          border-radius: 8px;
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 600;
          letter-spacing: 0.5px;
          width: fit-content;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 14px;
          border-radius: 14px;
          color: var(--foreground);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-weight: 500;
          font-size: 0.95rem;
          background: transparent;
        }

        .nav-item:hover {
          background: rgba(59, 130, 246, 0.08);
          transform: translateX(4px);
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          flex-shrink: 0;
        }

        .nav-item:hover .icon-wrapper {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .nav-label {
          flex: 1;
        }

        .nav-item.active {
          background: rgba(59, 130, 246, 0.1);
          transform: translateX(0);
        }

        .nav-item.active .icon-wrapper {
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
        }

        .active-bar {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 60%;
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 12px currentColor;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 16px;
        }

        .status-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: 12px;
          padding: 12px 14px;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground);
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-dot.online {
          background: #10b981;
          box-shadow: 0 0 12px #10b981;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.3);
          }
        }

        .version {
          font-size: 0.75rem;
          color: var(--secondary-text);
          font-family: monospace;
        }

        /* Scrollbar styling */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </aside>
  );
}
