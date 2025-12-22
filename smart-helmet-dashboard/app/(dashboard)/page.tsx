"use client";

import { AlertTriangle, ShieldCheck, AlertOctagon } from "lucide-react";
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8' }}>
      Loading Map...
    </div>
  )
});

export default function Home() {
  const { isAccidentActive, triggerAccident, setAccidentSeverity, clearAccident } = useAccident();

  // Mock User Data for Dashboard
  const userStatus = {
    status: "online" as const,
    battery: 85,
    lastSync: "Just now",
    deviceId: "SH-2024-001"
  };

  const [simulating, setSimulating] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [alertCount, setAlertCount] = useState(0);
  const [helmetConnected, setHelmetConnected] = useState(false);
  const [liveSensorData, setLiveSensorData] = useState<{ gForce: number, tilt: number } | null>(null);

  // Fetch alert count (only active alerts)
  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await fetch("/api/alerts/active-count");
        const data = await res.json();
        setAlertCount(data.count);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      }
    };
    fetchAlertCount();
  }, [isAccidentActive]); // Refresh when accident state changes

  // Connect to helmet server on mount - ONLY ONCE
  useEffect(() => {
    const serverUrl = 'http://100.106.213.78:3001'; // Updated to match server IP

    console.log('Connecting to helmet server...');
    helmetSocketService.connect(serverUrl);

    // Listen for connection status
    helmetSocketService.onConnection((connected) => {
      setHelmetConnected(connected);
      if (connected) {
        console.log('✅ Connected to helmet server');
      } else {
        console.log('❌ Disconnected from helmet server');
      }
    });

    // Listen for live sensor data from mobile app
    helmetSocketService.onSensorData((data) => {
      setLiveSensorData({ gForce: data.gForce, tilt: data.tilt });
    });

    // Listen for location updates from mobile app
    helmetSocketService.onLocationUpdate((location) => {
      setCurrentLocation({ lat: location.latitude, lng: location.longitude });
    });

    // Listen for accidents from mobile app
    const socket = helmetSocketService.getSocket();
    if (socket) {
      // When accident is detected - DON'T send email yet
      socket.on('accident_detected', (accidentData: any) => {
        console.log('🚨 Accident detected from mobile app:', accidentData);

        // Update location if provided
        if (accidentData.location) {
          setCurrentLocation({
            lat: accidentData.location.latitude,
            lng: accidentData.location.longitude
          });
        }

        // Just show a notification, don't send email yet
        toast('⚠️ Accident detected - waiting for user response...', { duration: 3000 });
      });

      // When user cancels - send low severity email
      socket.on('accident_cancelled', async (data: any) => {
        console.log('✅ Accident cancelled by user');

        setAccidentSeverity('low');

        const body = currentLocation
          ? { latitude: currentLocation.lat, longitude: currentLocation.lng, severity: 'low' }
          : { severity: 'low' };

        try {
          const res = await fetch("/api/simulate-accident", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const result = await res.json();

          if (result.success) {
            toast.success('Low severity alert sent (user cancelled)', { duration: 3000 });
          }
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      });

      // When timeout occurs (no cancel) - send HIGH severity email
      socket.on('accident_timeout', async (data: any) => {
        console.log('🚨 Accident timeout - no response from user!');

        setAccidentSeverity('high');

        const body = currentLocation
          ? { latitude: currentLocation.lat, longitude: currentLocation.lng, severity: 'high' }
          : { severity: 'high' };

        try {
          const res = await fetch("/api/simulate-accident", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
          });
          const result = await res.json();

          if (result.success) {
            toast.error('🚨 HIGH SEVERITY! Emergency email sent!', { duration: 5000 });
          } else {
            toast.error('Failed to send emergency notification');
          }
        } catch (error) {
          console.error('Error sending notification:', error);
          toast.error('Error sending emergency notification');
        }
      });
    }

    // Cleanup on unmount
    return () => {
      console.log('Disconnecting from helmet server...');
      helmetSocketService.disconnect();
    };
  }, []); // Empty dependency array - only run once on mount

  // Calculate safety score based on accidents
  // Formula: Start at 100, subtract 10 for each high severity, 5 for each low severity
  const calculateSafetyScore = () => {
    // This is a simple calculation - in production you'd fetch this from backend
    const baseScore = 100;
    const highSeverityPenalty = 10;
    const lowSeverityPenalty = 5;

    // For now, estimate based on alert count
    // Assume 50% are high severity, 50% low
    const estimatedHighCount = Math.floor(alertCount / 2);
    const estimatedLowCount = alertCount - estimatedHighCount;

    const score = Math.max(0, baseScore - (estimatedHighCount * highSeverityPenalty) - (estimatedLowCount * lowSeverityPenalty));
    return score;
  };

  const safetyScore = calculateSafetyScore();
  const safetyRating = safetyScore >= 90 ? "Excellent" : safetyScore >= 70 ? "Good" : safetyScore >= 50 ? "Fair" : "Poor";

  const handleSimulateCrash = () => {
    setSimulating(true);
    toast.loading("Detecting impact...", { id: "sim" });

    // Trigger accident state to halt movement
    triggerAccident();

    // Get current location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          toast.dismiss("sim");
          setShowSOSModal(true);
        },
        (err) => {
          console.warn("Could not get location:", err.message);
          setCurrentLocation(null);
          toast.dismiss("sim");
          setShowSOSModal(true);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      toast.dismiss("sim");
      setShowSOSModal(true);
    }
  };

  const handleSOSCancel = async () => {
    setShowSOSModal(false);
    setAccidentSeverity("low");
    toast.success("SOS Cancelled - Marked as false alarm", { id: "sos" });

    // Send low severity notification
    await sendAccidentNotification("low");

    setSimulating(false);
    clearAccident();
  };

  const handleSOSTimeout = async () => {
    setShowSOSModal(false);
    setAccidentSeverity("high");
    toast.error("No response - Emergency services notified!", { id: "sos", duration: 5000 });

    // Send high severity notification
    await sendAccidentNotification("high");

    setSimulating(false);
  };

  const sendAccidentNotification = async (severity: "high" | "low") => {
    try {
      const body = currentLocation
        ? { latitude: currentLocation.lat, longitude: currentLocation.lng, severity }
        : { severity };

      const res = await fetch("/api/simulate-accident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await res.json();

      if (!data.success) {
        console.error("Failed to send notification:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err);
    }
  };

  return (
    <div className="dashboard-container">
      <Toaster position="top-right" />
      {showSOSModal && (
        <SOSCancelModal onCancel={handleSOSCancel} onTimeout={handleSOSTimeout} />
      )}
      <div className="welcome-banner">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Welcome back, Rahul!</h1>
            <p>Here is your helmet status and riding summary.</p>
          </div>

          <button
            onClick={handleSimulateCrash}
            disabled={simulating}
            className="btn-danger-glow"
          >
            <AlertOctagon size={20} className={simulating ? "spin" : ""} />
            {simulating ? "Sending Alert..." : "Simulate Accident"}
          </button>
        </div>
      </div>

      <div className="layout-grid">
        {/* Left Column: Stats & Status */}
        <div className="left-column">
          <HelmetStatus {...userStatus} />

          <div className="stats-row">
            <div className="stat-card glass-panel">
              <div className="stat-icon danger">
                <AlertTriangle size={24} />
              </div>
              <div className="stat-info">
                <h3>My Alerts</h3>
                <p className="stat-value">{alertCount}</p>
                <span className="stat-trend">Total Accidents</span>
              </div>
            </div>

            <div className="stat-card glass-panel">
              <div className="stat-icon success">
                <ShieldCheck size={24} />
              </div>
              <div className="stat-info">
                <h3>Safety Score</h3>
                <p className="stat-value">{safetyScore}</p>
                <span className="stat-trend">{safetyRating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Map Preview / Activity */}
        <div className="right-column">
          <div className="live-map-preview glass-panel">
            <div className="panel-header">
              <h2>My Location</h2>
              <span className="live-indicator">
                <span className="pulse-dot"></span> Live
              </span>
            </div>
            <div className="map-embed">
              <MapView />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .btn-danger-glow {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
          transition: all 0.2s;
        }

        .btn-danger-glow:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
        }
        
        .btn-danger-glow:active {
          transform: scale(0.98);
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin { 100% { transform: rotate(360deg); } }

        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .welcome-banner h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .welcome-banner p {
          color: var(--secondary-text, #94a3b8);
        }

        .layout-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 24px;
        }
        
        @media (max-width: 1024px) {
           .layout-grid { grid-template-columns: 1fr; }
        }

        .left-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.danger { background: var(--danger); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
        .stat-icon.success { background: var(--success); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }

        .stat-info h3 {
          font-size: 0.9rem;
          color: var(--secondary-text, #94a3b8);
          font-weight: 500;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-trend {
          font-size: 0.8rem;
          color: var(--secondary-text, #64748b);
        }

        .right-column {
          display: flex;
          flex-direction: column;
        }

        .live-map-preview {
          padding: 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 400px;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .live-indicator {
           display: flex;
           align-items: center;
           gap: 8px;
           color: var(--danger);
           font-weight: 600;
           font-size: 0.9rem;
        }
        
        .pulse-dot {
           width: 8px;
           height: 8px;
           background: var(--danger);
           border-radius: 50%;
           animation: pulse-red 1.5s infinite;
        }
        
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
         }

         .map-embed {
           flex: 1;
           border-radius: 12px;
           overflow: hidden;
           min-height: 350px;
         }
         
         .map-embed :global(.map-container) {
           height: 100% !important;
         }
      `}</style>
    </div>
  );
}
