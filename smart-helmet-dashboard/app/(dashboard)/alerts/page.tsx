"use client";

import { useEffect, useState } from "react";
import AlertCard from "@/components/AlertCard";
import Skeleton from "@/components/Skeleton";
import { Filter, RefreshCcw } from "lucide-react";

type Alert = {
  id: string;
  riderName: string;
  helmetId: string;
  timestamp: string;
  location: string;
  severity: "high" | "medium" | "low";
  isCancelled: boolean;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      setAlerts(data);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert: any) => {
    // In a real app, backend filters by user. Here we simulate "My Alerts".
    // For this demo, let's assume all alerts with name "Rahul Kumar" are ours.
    if (alert.riderName !== "Rahul Kumar") return false;

    if (filter === "all") return true;
    if (filter === "active") return alert.isActive;
    if (filter === "inactive") return !alert.isActive;
    if (filter === "high") return alert.severity === "high";
    if (filter === "low") return alert.severity === "low";
    return true;
  });

  return (
    <div className="alerts-page">
      <div className="page-header">
        <div>
          <h1>My Alerts</h1>
          <p>History of alerts triggered by your helmet.</p>
        </div>

        <div className="filter-controls">
          <button onClick={fetchAlerts} className="icon-btn" title="Refresh">
            <RefreshCcw size={16} />
          </button>
          <div className="separator"></div>
          <Filter size={16} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Alerts</option>
            <option value="active">Active Only (24h)</option>
            <option value="inactive">Deactivated (&gt;24h)</option>
            <option value="high">High Severity</option>
            <option value="low">False Alarms / Low Severity</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="alerts-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-panel" style={{ height: '200px', padding: '24px' }}>
              <Skeleton style={{ width: '60%', height: '24px', marginBottom: '16px' }} />
              <Skeleton style={{ width: '100%', height: '20px', marginBottom: '8px' }} />
              <Skeleton style={{ width: '80%', height: '20px', marginBottom: '24px' }} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Skeleton style={{ width: '40%', height: '36px' }} />
                <Skeleton style={{ width: '40%', height: '36px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="alerts-grid">
          {filteredAlerts.length > 0 ? filteredAlerts.map((alertItem: any) => (
            <AlertCard
              key={alertItem.id}
              id={alertItem.id}
              riderName={alertItem.riderName}
              helmetId={alertItem.helmetId}
              timestamp={alertItem.timestamp}
              location={alertItem.location}
              latitude={alertItem.latitude}
              longitude={alertItem.longitude}
              severity={alertItem.severity}
              isCancelled={alertItem.isCancelled}
              onViewMap={() => console.log("Navigate to map coordinate: " + alertItem.location)}
            />
          )) : (
            <div className="empty-state">No alerts found matching filter.</div>
          )}
        </div>
      )}

      <style jsx>{`
        .alerts-page {
          padding-bottom: 40px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 32px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .page-header p {
          color: var(--secondary-text, #94a3b8);
        }

        .filter-controls {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--card-bg, rgba(30, 41, 59, 0.6));
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid var(--card-border);
        }

        .filter-select {
          background: transparent;
          border: none;
          color: var(--foreground);
          outline: none;
          font-size: 0.9rem;
          cursor: pointer;
        }
        
        .filter-select option {
          background: var(--background);
          color: var(--foreground);
        }

        .icon-btn {
          background: transparent;
          border: none;
          color: var(--foreground);
          cursor: pointer;
          display: flex;
          align-items: center;
          opacity: 0.7;
          transition: opacity 0.2s;
        }
        
        .icon-btn:hover {
           opacity: 1;
        }

        .separator {
          width: 1px;
          height: 20px;
          background: var(--card-border);
          margin: 0 4px;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }
        
        .loading-state, .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--secondary-text, #94a3b8);
          grid-column: 1 / -1;
        }
      `}</style>
    </div>
  );
}
