"use client";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Global Chart Defaults
ChartJS.defaults.color = "#94a3b8";
ChartJS.defaults.borderColor = "rgba(148, 163, 184, 0.1)";

const LineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
        {
            label: "Accidents",
            data: [2, 1, 0, 3, 2, 4, 1],
            borderColor: "#ef4444",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            fill: true,
            tension: 0.4,
        },
        {
            label: "False Alarms",
            data: [4, 2, 1, 2, 3, 1, 0],
            borderColor: "#f59e0b",
            backgroundColor: "rgba(245, 158, 11, 0.1)",
            fill: true,
            tension: 0.4,
        }
    ],
};

const SeverityData = {
    labels: ["High Impact", "Medium Impact", "Low Impact"],
    datasets: [
        {
            data: [15, 30, 55],
            backgroundColor: ["#ef4444", "#f59e0b", "#10b981"],
            borderWidth: 0,
        },
    ],
};

const HotspotData = {
    labels: ["MG Road", "NH-8", "Cyber City", "Golf Course Rd", "Sec 29"],
    datasets: [
        {
            label: "Incident Count",
            data: [12, 19, 8, 5, 3],
            backgroundColor: "#3b82f6",
            borderRadius: 4,
        },
    ],
};

export default function AnalyticsPage() {
    return (
        <div className="analytics-page">
            <div className="page-header">
                <h1>Analytics Overview</h1>
                <p>Data-driven insights for safety improvements.</p>
            </div>

            <div className="charts-grid">
                <div className="chart-card full-width glass-panel">
                    <h3>Accident Trends (Last 7 Days)</h3>
                    <div className="chart-container-lg">
                        <Line data={LineData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="chart-card glass-panel">
                    <h3>Severity Distribution</h3>
                    <div className="chart-container">
                        <Doughnut data={SeverityData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="chart-card glass-panel">
                    <h3>High Risk Zones</h3>
                    <div className="chart-container">
                        <Bar data={HotspotData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>
            </div>

            <style jsx>{`
        .analytics-page {
          padding-bottom: 40px;
        }

        .page-header {
          margin-bottom: 32px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .chart-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
        }

        .full-width {
          grid-column: span 2;
        }

        .chart-card h3 {
          margin-bottom: 20px;
          font-size: 1.1rem;
        }

        .chart-container {
          height: 300px;
          position: relative;
        }

        .chart-container-lg {
          height: 400px;
          position: relative;
        }

        @media (max-width: 1000px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
          .full-width {
            grid-column: span 1;
          }
        }
      `}</style>
        </div>
    );
}
