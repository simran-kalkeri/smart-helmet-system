"use client";

import { useEffect, useState } from "react";
import AlertCard from "@/components/AlertCard";
import { Filter, RefreshCw, AlertTriangle, Download } from "lucide-react";

type Alert = {
  id: string;
  riderName: string;
  helmetId: string;
  timestamp: string;
  timestampMs?: number;
  location: string;
  latitude?: string;
  longitude?: string;
  severity: "high" | "low";
  isCancelled: boolean;
  isActive?: boolean;
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

  const filteredAlerts = alerts
    .filter((alert: Alert) => {
      if (alert.riderName !== "Simran Kalkeri") return false;

      if (filter === "all") return true;
      if (filter === "active") return alert.isActive;
      if (filter === "high") return alert.severity === "high";
      if (filter === "low") return alert.severity === "low";
      return true;
    })
    .sort((a: Alert, b: Alert) => (b.timestampMs || 0) - (a.timestampMs || 0));

  const exportToCSV = () => {
    if (filteredAlerts.length === 0) {
      alert("No alerts to export");
      return;
    }

    // CSV Headers
    const headers = ["ID", "Rider Name", "Helmet ID", "Timestamp", "Location", "Latitude", "Longitude", "Severity", "Cancelled", "Active"];

    // CSV Rows
    const rows = filteredAlerts.map(alert => [
      alert.id,
      alert.riderName,
      alert.helmetId,
      alert.timestamp,
      alert.location,
      alert.latitude || "N/A",
      alert.longitude || "N/A",
      alert.severity,
      alert.isCancelled ? "Yes" : "No",
      alert.isActive ? "Yes" : "No"
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(field => `"${field}"`).join(","))
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `my-alerts-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="alerts-page animate-fadeIn">
      <header className="page-header">
        <div>
          <h1>My Alerts</h1>
          <p>History of alerts triggered by your helmet</p>
        </div>

        <div className="controls">
          <button onClick={exportToCSV} className="btn btn-primary">
            <Download size={16} />
            Export to CSV
          </button>
          <button onClick={fetchAlerts} className="btn btn-ghost">
            <RefreshCw size={16} />
          </button>
          <div className="filter-group">
            <Filter size={16} />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Alerts</option>
              <option value="active">Active (24h)</option>
              <option value="high">High Severity</option>
              <option value="low">Low Severity</option>
            </select>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loading">
          <RefreshCw size={24} className="spin" />
          <span>Loading alerts...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="empty glass-panel">
          <AlertTriangle size={48} />
          <h3>No alerts found</h3>
          <p>No alerts match your current filter.</p>
        </div>
      ) : (
        <div className="alerts-grid">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              id={alert.id}
              riderName={alert.riderName}
              helmetId={alert.helmetId}
              timestamp={alert.timestamp}
              location={alert.location}
              latitude={alert.latitude}
              longitude={alert.longitude}
              severity={alert.severity}
              isCancelled={alert.isCancelled}
              onViewMap={() => console.log("View map:", alert.location)}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        .alerts-page {
          padding-bottom: 40px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--space-xl);
        }

        .page-header h1 {
          font-size: 1.75rem;
          margin-bottom: 4px;
        }

        .page-header p {
          color: var(--foreground-muted);
          font-size: 0.9rem;
        }

        .controls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 10px;
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          color: var(--foreground-muted);
        }

        .filter-group select {
          background: transparent;
          border: none;
          color: var(--foreground);
          font-size: 0.9rem;
          cursor: pointer;
          outline: none;
        }

        .filter-group select option {
          background: var(--background);
          color: var(--foreground);
        }

        .loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 300px;
          color: var(--foreground-muted);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px 40px;
          text-align: center;
          color: var(--foreground-muted);
        }

        .empty h3 {
          font-size: 1.1rem;
          color: var(--foreground);
        }

        .empty p {
          font-size: 0.9rem;
        }

        .alerts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: var(--space-lg);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }

          .alerts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
