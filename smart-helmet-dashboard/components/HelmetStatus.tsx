"use client";

import { Wifi, WifiOff, Battery, RefreshCw, Activity } from "lucide-react";

type HelmetStatusProps = {
    status: "online" | "offline";
    battery: number;
    lastSync: string;
    deviceId: string;
};

export default function HelmetStatus({ status, battery, lastSync, deviceId }: HelmetStatusProps) {
    return (
        <div className="helmet-status-card glass-panel">
            <div className="card-header">
                <h3>Helmet Status</h3>
                <span className={`status-badge ${status}`}>
                    {status === "online" ? <Wifi size={14} /> : <WifiOff size={14} />}
                    {status === "online" ? "Connected" : "Offline"}
                </span>
            </div>

            <div className="status-grid">
                <div className="status-item">
                    <div className="icon-wrapper primary">
                        <Activity size={20} />
                    </div>
                    <div className="status-info">
                        <label>Device ID</label>
                        <span>{deviceId}</span>
                    </div>
                </div>

                <div className="status-item">
                    <div className="icon-wrapper accent">
                        <Battery size={20} className={battery < 20 ? "low-battery" : ""} />
                    </div>
                    <div className="status-info">
                        <label>Battery</label>
                        <span className={battery < 20 ? "text-danger" : ""}>{battery}%</span>
                    </div>
                </div>

                <div className="status-item full-width">
                    <div className="icon-wrapper">
                        <RefreshCw size={16} />
                    </div>
                    <div className="status-info">
                        <label>Last Synced</label>
                        <span>{lastSync}</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .helmet-status-card {
          padding: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status-badge.online {
          background: rgba(16, 185, 129, 0.2);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .status-badge.offline {
          background: rgba(100, 116, 139, 0.2);
          color: #94a3b8;
          border: 1px solid rgba(100, 116, 139, 0.3);
        }

        .status-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.03);
          padding: 12px;
          border-radius: 12px;
        }
        
        .status-item.full-width {
          grid-column: 1 / -1;
        }

        .icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--foreground);
        }

        .icon-wrapper.primary { background: rgba(59, 130, 246, 0.1); color: var(--primary); }
        .icon-wrapper.accent { background: rgba(245, 158, 11, 0.1); color: var(--accent); }

        .status-info {
          display: flex;
          flex-direction: column;
        }

        .status-info label {
          font-size: 0.75rem;
          color: var(--secondary-text, #94a3b8);
          margin-bottom: 2px;
        }

        .status-info span {
          font-weight: 600;
          font-size: 0.95rem;
        }
        
        .low-battery { color: var(--danger); }
        .text-danger { color: var(--danger); }
      `}</style>
        </div>
    );
}
