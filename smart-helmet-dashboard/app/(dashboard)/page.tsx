"use client";

import { Activity, Cpu, Radio, AlertOctagon, Zap, Shield } from "lucide-react";
import HelmetStatus from "@/components/HelmetStatus";
import { Toaster, toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAccident } from "@/context/AccidentContext";
import SOSCancelModal from "@/components/SOSCancelModal";
import helmetSocketService from "@/lib/helmetSocketService";

const MapView = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <Radio size={24} className="pulse" />
      <span>Loading map...</span>
    </div>
  )
});

export default function Home() {
  const { isAccidentActive, triggerAccident, setAccidentSeverity, clearAccident } = useAccident();

  const userStatus = {
    status: "online" as const,
    battery: 85,
    lastSync: "Just now",
    deviceId: "SH-2024-001"
  };

  const [simulating, setSimulating] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [helmetConnected, setHelmetConnected] = useState(false);
  const [liveSensorData, setLiveSensorData] = useState<{ gForce: number, tilt: number } | null>(null);
  const [mqttConnected, setMqttConnected] = useState(false);

  useEffect(() => {
    const serverUrl = process.env.NEXT_PUBLIC_HELMET_SERVER_URL || 'http://100.106.213.78:3001';
    const socket = helmetSocketService.connect(serverUrl);

    helmetSocketService.onConnection((connected) => {
      setHelmetConnected(connected);
      setMqttConnected(connected);
    });

    helmetSocketService.onSensorData((data) => {
      setLiveSensorData({ gForce: data.gForce, tilt: data.tilt });
    });

    helmetSocketService.onLocationUpdate((location) => {
      setCurrentLocation({ lat: location.latitude, lng: location.longitude });
    });

    if (socket) {
      socket.on('helmet_event', (event: any) => {
        switch (event.type) {
          case 'ACCIDENT_PENDING':
            toast('Impact detected - Monitoring...', { icon: '⚠️', duration: 5000 });
            if (event.location) {
              setCurrentLocation({ lat: event.location.latitude, lng: event.location.longitude });
            }
            break;
          case 'CRASH_CANCELLED':
            toast.success('Alert cancelled - Low severity', { duration: 4000 });
            break;
          case 'CRASH_CONFIRMED':
            toast.error('High severity - Email sent', { duration: 6000 });
            break;
        }
      });
    }

    return () => { helmetSocketService.disconnect(); };
  }, []);

  const handleSimulateCrash = () => {
    setSimulating(true);
    toast.loading("Detecting...", { id: "sim" });
    triggerAccident();

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          toast.dismiss("sim");
          setShowSOSModal(true);
        },
        () => { toast.dismiss("sim"); setShowSOSModal(true); },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      toast.dismiss("sim");
      setShowSOSModal(true);
    }
  };

  const handleSOSCancel = async () => {
    setShowSOSModal(false);
    setAccidentSeverity("low");
    toast.success("Alert cancelled");
    await sendNotification("low");
    setSimulating(false);
    clearAccident();
  };

  const handleSOSTimeout = async () => {
    setShowSOSModal(false);
    setAccidentSeverity("high");
    toast.error("Emergency notified", { duration: 5000 });
    await sendNotification("high");
    setSimulating(false);
  };

  const sendNotification = async (severity: "high" | "low") => {
    try {
      await fetch("/api/simulate-accident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentLocation
          ? { latitude: currentLocation.lat, longitude: currentLocation.lng, severity }
          : { severity })
      });
    } catch (err) { console.error("Error:", err); }
  };

  return (
    <div className="dashboard animate-fadeIn">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--card-bg)',
            color: 'var(--foreground)',
            border: '1px solid var(--card-border)',
            borderRadius: '12px',
            backdropFilter: 'blur(12px)'
          }
        }}
      />

      {showSOSModal && (
        <SOSCancelModal onCancel={handleSOSCancel} onTimeout={handleSOSTimeout} />
      )}

      {/* Header */}
      <header className="page-header">
        <div className="header-left">
          <h1>Dashboard</h1>
          <p>Real-time helmet monitoring & crash detection</p>
        </div>
        <button onClick={handleSimulateCrash} disabled={simulating} className="test-btn">
          <AlertOctagon size={18} />
          {simulating ? "Testing..." : "Simulate Accident"}
        </button>
      </header>

      {/* Main Grid */}
      <div className="grid">
        {/* Left Column */}
        <div className="col-left">
          <HelmetStatus {...userStatus} />

          {/* Sensor Fusion Card */}
          <div className="glass-panel card">
            <div className="card-header">
              <div className="card-icon">
                <Activity size={20} />
              </div>
              <h3>Sensor Fusion</h3>
              <span className="badge badge-success">Active</span>
            </div>
            <div className="card-body">
              <div className="data-row">
                <span className="label">Accelerometer</span>
                <span className="value success">● Online</span>
              </div>
              <div className="data-row">
                <span className="label">Gyroscope</span>
                <span className="value success">● Online</span>
              </div>
              <div className="data-row">
                <span className="label">Fusion Mode</span>
                <span className="value">Normal</span>
              </div>
              <div className="data-row">
                <span className="label">Confidence</span>
                <span className="value success">High</span>
              </div>
            </div>
          </div>

          {/* Crash Detection Card */}
          <div className="glass-panel card">
            <div className="card-header">
              <div className="card-icon">
                <Cpu size={20} />
              </div>
              <h3>Crash Detection</h3>
              <span className="badge badge-primary">Enabled</span>
            </div>
            <div className="card-body">
              <div className="data-row">
                <span className="label">IMU Status</span>
                <span className="value success">● Active</span>
              </div>
              <div className="data-row">
                <span className="label">Detection</span>
                <span className="value">Armed</span>
              </div>
              <div className="data-row">
                <span className="label">Sensitivity</span>
                <span className="value">Normal</span>
              </div>
              <div className="data-row">
                <span className="label">MQTT</span>
                <span className={`value ${mqttConnected ? 'success' : 'danger'}`}>
                  ● {mqttConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Map */}
        <div className="col-right">
          <div className="glass-panel map-panel">
            <div className="card-header">
              <div className="card-icon">
                <Radio size={20} />
              </div>
              <h3>Live Location</h3>
              <div className="status-dot"></div>
            </div>
            <div className="map-container">
              <MapView />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
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

        .test-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--danger-muted);
          border: 1px solid var(--danger-border);
          border-radius: var(--radius-md);
          color: var(--danger);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .test-btn:hover:not(:disabled) {
          background: var(--danger);
          color: white;
        }

        .test-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .grid {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: var(--space-lg);
        }

        .col-left {
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .col-left > :global(*) {
          flex: 1;
        }

        .card {
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
        }

        .card .card-body {
          flex: 1;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: var(--space-md);
          padding-bottom: var(--space-md);
          border-bottom: 1px solid var(--card-border);
        }

        .card-icon {
          color: var(--foreground-muted);
        }

        .card-header h3 {
          flex: 1;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .data-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .label {
          color: var(--foreground-muted);
          font-size: 0.85rem;
        }

        .value {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--foreground);
        }

        .value.success { color: var(--success); }
        .value.danger { color: var(--danger); }

        .col-right {
          display: flex;
          flex-direction: column;
        }

        .map-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 500px;
          padding: var(--space-lg);
        }

        .map-container {
          flex: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--background-secondary);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .map-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          height: 100%;
          color: var(--foreground-muted);
        }

        .pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @media (max-width: 1024px) {
          .grid {
            grid-template-columns: 1fr;
          }
          
          .map-panel {
            min-height: 400px;
          }
        }
      `}</style>
    </div>
  );
}
