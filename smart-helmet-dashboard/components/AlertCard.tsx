"use client";

import { AlertTriangle, Clock, MapPin, Navigation, XCircle, CheckCircle } from "lucide-react";

type AlertSeverity = "high" | "medium" | "low";

interface AlertProps {
  id: string;
  riderName: string;
  helmetId: string;
  timestamp: string;
  location: string;
  latitude?: string;
  longitude?: string;
  severity: AlertSeverity;
  isCancelled: boolean;
  onViewMap: () => void;
}

export default function AlertCard({
  riderName,
  helmetId,
  timestamp,
  location,
  latitude,
  longitude,
  severity,
  isCancelled,
  onViewMap,
}: AlertProps) {
  const severeColor =
    severity === "high" ? "var(--danger)" :
      severity === "medium" ? "var(--accent)" :
        "var(--success)";

  return (
    <div className="alert-card glass-panel">
      <div className="alert-status-strip" style={{ background: severeColor }}></div>

      <div className="alert-content">
        <div className="alert-header">
          <div className="rider-info">
            <h3>{riderName}</h3>
            <span className="helmet-id">ID: {helmetId}</span>
          </div>
          <div className={`severity-badge ${severity}`}>
            {severity.toUpperCase()} IMPACT
          </div>
        </div>

        <div className="alert-details">
          <div className="detail-item">
            <Clock size={16} />
            <span>{timestamp}</span>
          </div>
          <div className="detail-item">
            <MapPin size={16} />
            <span>{location}</span>
          </div>
        </div>

        {isCancelled ? (
          <div className="status-cancelled">
            <XCircle size={18} />
            <span>Alert Cancelled by Rider</span>
          </div>
        ) : (
          <div className="alert-actions">
            <button
              className="btn btn-primary action-btn"
              onClick={() => {
                if (latitude && longitude) {
                  window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
                } else {
                  alert('Location data not available');
                }
              }}
            >
              <Navigation size={16} /> Locate
            </button>
            {severity === "high" ? (
              <div className="sos-sent">
                <CheckCircle size={18} />
                <span>Emergency SOS Sent Automatically</span>
              </div>
            ) : (
              <button
                className="btn btn-danger action-btn"
                onClick={() => {
                  if (confirm(`Send emergency SOS for ${riderName}?`)) {
                    alert('Emergency services have been notified!');
                  }
                }}
              >
                Emergency SOS
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .alert-card {
          position: relative;
          overflow: hidden;
          padding: 0;
          display: flex;
          transition: transform 0.2s;
        }
        
        .alert-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
        }

        .alert-status-strip {
          width: 6px;
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
        }

        .alert-content {
          flex: 1;
          padding: 20px 20px 20px 26px;
        }

        .alert-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .rider-info h3 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .helmet-id {
          font-size: 0.8rem;
          color: #94a3b8;
          font-family: monospace;
        }

        .severity-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 4px;
          color: rgba(0,0,0,0.8);
        }

        .severity-badge.high { background: var(--danger); color: white; }
        .severity-badge.medium { background: var(--accent); color: white; }
        .severity-badge.low { background: var(--success); color: white; }

        .alert-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 20px;
        }

        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        .alert-actions {
          display: flex;
          gap: 12px;
        }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 0.85rem;
          padding: 8px 12px;
        }

        .status-cancelled {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          background: rgba(255,255,255,0.05);
          padding: 10px;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .sos-sent {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--success);
          background: rgba(16, 185, 129, 0.1);
          padding: 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
