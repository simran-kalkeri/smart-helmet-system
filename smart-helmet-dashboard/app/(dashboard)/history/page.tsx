"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, Search, Calendar, FileText, RefreshCcw } from "lucide-react";

type HistoryItem = {
    id: string;
    rider: string;
    deviceId: string;
    time: string;
    gps: string;
    impact: number;
    forwarded: boolean;
    cancelled: boolean;
};

export default function HistoryPage() {
    const [historyData, setHistoryData] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState<{ key: keyof HistoryItem; direction: "asc" | "desc" }>({ key: "time", direction: "desc" });

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/history");
            const data = await res.json();
            setHistoryData(data);
        } catch (error) {
            console.error("Failed to fetch history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSort = (key: keyof HistoryItem) => {
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...historyData].filter(
        (item) =>
            (item.rider || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.deviceId || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    return (
        <div className="history-page">
            <div className="page-header">
                <h1>My Accident History</h1>
                <div className="actions">
                    <div className="search-box">
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Search by rider or device ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="icon-btn" onClick={fetchHistory} title="Refresh">
                        <RefreshCcw size={20} />
                    </button>
                    <button className="btn btn-primary">
                        <FileText size={16} style={{ marginRight: 8 }} />
                        Export CSV
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state glass-panel">Loading History...</div>
            ) : (
                <div className="table-container glass-panel">
                    <table>
                        <thead>
                            <tr>
                                <th onClick={() => handleSort("id")}>Event ID <ArrowUpDown size={14} /></th>
                                <th>Device ID</th>
                                <th onClick={() => handleSort("time")}>Date & Time <ArrowUpDown size={14} /></th>
                                <th>GPS</th>
                                <th onClick={() => handleSort("impact")}>Impact (g) <ArrowUpDown size={14} /></th>
                                <th>Alert Sent</th>
                                <th>Cancelled</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData
                                .filter(row => row.rider === "Simran Kalkeri") // Mock User Filter
                                .map((row) => (
                                    <tr key={row.id}>
                                        <td className="mono">{row.id}</td>
                                        <td className="mono">{row.deviceId}</td>
                                        <td>{row.time}</td>
                                        <td className="mono-sm">{row.gps}</td>
                                        <td>
                                            <span className={`impact-badge ${row.impact > 80 ? "high" : row.impact > 40 ? "medium" : "low"}`}>
                                                {row.impact}g
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-dot ${row.forwarded ? "success" : "neutral"}`}></span>
                                            {row.forwarded ? "Yes" : "No"}
                                        </td>
                                        <td>
                                            {row.cancelled ? (
                                                <span className="cancelled-tag">Cancelled</span>
                                            ) : (
                                                <span className="valid-tag">Valid</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style jsx>{`
        .history-page {
          padding-bottom: 40px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .actions {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: var(--card-bg, rgba(30, 41, 59, 0.6));
          border: 1px solid var(--card-border);
          padding: 8px 12px;
          border-radius: 8px;
          gap: 8px;
        }

        .search-box input {
          background: transparent;
          border: none;
          color: var(--foreground);
          outline: none;
          width: 250px;
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        th {
          text-align: left;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--secondary-text, #94a3b8);
          font-weight: 600;
          cursor: pointer;
          user-select: none;
        }
        
        th:hover {
           color: var(--foreground);
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--card-border);
          color: var(--secondary-text, #cbd5e1);
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        .mono { font-family: monospace; color: var(--secondary-text, #94a3b8); }
        .mono-sm { font-family: monospace; font-size: 0.85rem; color: #64748b; }
        .highlight { color: var(--foreground); font-weight: 500; }

        .impact-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 0.8rem;
        }

        .impact-badge.high { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
        .impact-badge.medium { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
        .impact-badge.low { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }

        .status-dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
        }

        .status-dot.success { background: var(--success); }
        .status-dot.neutral { background: #64748b; }

        .cancelled-tag {
          color: var(--secondary-text, #94a3b8);
          font-style: italic;
        }
        
        .icon-btn {
          background: transparent;
          border: none;
          color: var(--foreground);
          cursor: pointer;
          opacity: 0.7;
          display: flex;
          align-items: center;
        }
        .icon-btn:hover { opacity: 1; }
        
        .loading-state {
           padding: 40px;
           text-align: center;
           color: var(--secondary-text);
        }
      `}</style>
        </div>
    );
}
