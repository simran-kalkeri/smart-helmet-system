"use client";

import { useState, useEffect } from 'react';
import { Line, Bar } from "react-chartjs-2";
import { TrendingUp, BarChart3, Activity, RefreshCw } from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { useTheme } from "@/context/ThemeContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Accident {
    severity: string;
    timestamp: number;
}

export default function AnalyticsPage() {
    const { theme } = useTheme();
    const [stats, setStats] = useState({ highSeverity: 0, lowSeverity: 0 });
    const [accidents, setAccidents] = useState<Accident[]>([]);
    const [loading, setLoading] = useState(true);

    // Theme-aware chart colors
    const chartColors = {
        text: theme === 'dark' ? '#94a3b8' : '#64748b',
        grid: theme === 'dark' ? 'rgba(71, 85, 105, 0.2)' : 'rgba(203, 213, 225, 0.5)',
        high: '#ef4444',
        low: '#f59e0b',
        highBg: theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        lowBg: theme === 'dark' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
    };

    useEffect(() => {
        ChartJS.defaults.color = chartColors.text;
        ChartJS.defaults.borderColor = chartColors.grid;
    }, [theme]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/accidents');
            const data = await res.json();
            if (data.success) {
                setStats({
                    highSeverity: data.stats.highSeverity,
                    lowSeverity: data.stats.lowSeverity
                });
                setAccidents(data.accidents || []);
            }
        } catch (error) {
            console.error('Failed to fetch:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTimeData = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        const labels: string[] = [];
        const highData: number[] = [];
        const lowData: number[] = [];

        for (let i = 9; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(days[date.getDay()]);

            const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();

            const dayAccidents = accidents.filter(a => a.timestamp >= dayStart && a.timestamp <= dayEnd);
            highData.push(dayAccidents.filter(a => a.severity === 'high').length);
            lowData.push(dayAccidents.filter(a => a.severity === 'low').length);
        }

        return { labels, highData, lowData };
    };

    const timeData = getTimeData();

    if (loading) {
        return (
            <div className="loading">
                <RefreshCw size={24} className="spin" />
                <span>Loading analytics...</span>
                <style jsx>{`
                    .loading {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        justify-content: center;
                        height: 400px;
                        color: var(--foreground-muted);
                    }
                    .spin { animation: spin 1s linear infinite; }
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="analytics animate-fadeIn">
            <header className="page-header">
                <div>
                    <h1>Analytics</h1>
                    <p>Accident statistics and trends</p>
                </div>
                <button onClick={fetchData} className="btn btn-ghost">
                    <RefreshCw size={16} />
                    Refresh
                </button>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="glass-panel stat-card high">
                    <div className="stat-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">High Severity</span>
                        <span className="stat-value">{stats.highSeverity}</span>
                        <span className="stat-desc">Email alerts sent</span>
                    </div>
                </div>
                <div className="glass-panel stat-card low">
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Low Severity</span>
                        <span className="stat-value">{stats.lowSeverity}</span>
                        <span className="stat-desc">Cancelled by user</span>
                    </div>
                </div>
            </div>

            {/* Time Graph */}
            <div className="glass-panel chart-card">
                <div className="chart-header">
                    <TrendingUp size={18} />
                    <h3>Accidents Over Time</h3>
                    <span className="badge badge-primary">Last 10 days</span>
                </div>
                <div className="chart-container">
                    <Line
                        data={{
                            labels: timeData.labels,
                            datasets: [
                                {
                                    label: "High Severity",
                                    data: timeData.highData,
                                    borderColor: chartColors.high,
                                    backgroundColor: chartColors.highBg,
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 2
                                },
                                {
                                    label: "Low Severity",
                                    data: timeData.lowData,
                                    borderColor: chartColors.low,
                                    backgroundColor: chartColors.lowBg,
                                    fill: true,
                                    tension: 0.4,
                                    borderWidth: 2
                                }
                            ]
                        }}
                        options={{
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { position: 'top', align: 'end', labels: { boxWidth: 12, padding: 16 } }
                            },
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: chartColors.grid } },
                                x: { grid: { color: chartColors.grid } }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Bar Graph */}
            <div className="glass-panel chart-card">
                <div className="chart-header">
                    <BarChart3 size={18} />
                    <h3>Severity Comparison</h3>
                </div>
                <div className="chart-container small">
                    <Bar
                        data={{
                            labels: ["High Severity", "Low Severity"],
                            datasets: [{
                                label: "Accidents",
                                data: [stats.highSeverity, stats.lowSeverity],
                                backgroundColor: [chartColors.high, chartColors.low],
                                borderRadius: 8,
                                borderWidth: 0
                            }]
                        }}
                        options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { display: false } },
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: chartColors.grid } },
                                x: { grid: { display: false } }
                            }
                        }}
                    />
                </div>
            </div>

            <style jsx>{`
                .analytics { padding-bottom: 40px; }

                .page-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: var(--space-xl);
                }

                .page-header h1 { font-size: 1.75rem; margin-bottom: 4px; }
                .page-header p { color: var(--foreground-muted); font-size: 0.9rem; }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-lg);
                    margin-bottom: var(--space-lg);
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: var(--space-lg);
                    padding: var(--space-xl);
                }

                .stat-card.high { border-left: 3px solid var(--danger); }
                .stat-card.low { border-left: 3px solid var(--warning); }

                .stat-icon {
                    width: 56px;
                    height: 56px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-lg);
                    color: var(--foreground-muted);
                    background: var(--background-secondary);
                }

                .stat-card.high .stat-icon { color: var(--danger); background: var(--danger-muted); }
                .stat-card.low .stat-icon { color: var(--warning); background: var(--warning-muted); }

                .stat-content { display: flex; flex-direction: column; }
                .stat-label { font-size: 0.85rem; color: var(--foreground-muted); margin-bottom: 4px; }
                .stat-value { font-size: 2.5rem; font-weight: 700; line-height: 1; }
                .stat-desc { font-size: 0.8rem; color: var(--foreground-subtle); margin-top: 4px; }

                .chart-card { padding: var(--space-lg); margin-bottom: var(--space-lg); }

                .chart-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: var(--space-lg);
                    color: var(--foreground-muted);
                }

                .chart-header h3 { flex: 1; font-size: 0.95rem; font-weight: 500; color: var(--foreground); }
                .chart-container { height: 280px; position: relative; }
                .chart-container.small { height: 200px; }

                @media (max-width: 768px) {
                    .stats-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    );
}
