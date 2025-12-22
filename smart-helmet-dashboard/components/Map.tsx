"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState, useRef } from "react";
import { useAccident } from "@/context/AccidentContext";

// Component to update map center when position changes
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Helper function to generate random position within radius (in meters)
function getRandomPositionInRadius(center: [number, number], radiusInMeters: number): [number, number] {
    const radiusInDegrees = radiusInMeters / 111320; // Convert meters to degrees (approx)

    // Random angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radiusInDegrees;

    const deltaLat = distance * Math.cos(angle);
    const deltaLng = distance * Math.sin(angle);

    return [
        center[0] + deltaLat,
        center[1] + deltaLng
    ];
}

export default function MapView() {
    const { isAccidentActive } = useAccident();
    const [position, setPosition] = useState<[number, number]>([15.3647, 75.1240]); // Default: Hubballi
    const [centerPosition, setCenterPosition] = useState<[number, number]>([15.3647, 75.1240]); // Actual GPS center
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const watchIdRef = useRef<number | null>(null);

    useEffect(() => {
        // Fix Leaflet icons
        // @ts-ignore
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
            iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
            shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        // Get actual GPS location as center point
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    const gpsCenter: [number, number] = [latitude, longitude];
                    setCenterPosition(gpsCenter);
                    setPosition(gpsCenter);
                    setIsTracking(true);
                    setError(null);
                },
                (err) => {
                    console.warn("Geolocation error:", err.message);
                    setError("Location access denied. Using default location.");
                    setIsTracking(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );

            // Watch for GPS center updates (if user actually moves to different area)
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setCenterPosition([latitude, longitude]);
                    setIsTracking(true);
                    setError(null);
                },
                (err) => {
                    console.warn("Geolocation watch error:", err.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
            );

            watchIdRef.current = watchId;

            return () => {
                if (watchIdRef.current !== null) {
                    navigator.geolocation.clearWatch(watchIdRef.current);
                }
            };
        } else {
            setError("Geolocation not supported by browser.");
        }
    }, []);

    // Simulate movement around the GPS center point
    useEffect(() => {
        if (!isTracking) return;

        const movementInterval = setInterval(() => {
            if (!isAccidentActive) {
                // Generate new position within 10m radius of center
                const newPosition = getRandomPositionInRadius(centerPosition, 10);
                setPosition(newPosition);
            }
        }, 2000); // Update every 2 seconds

        return () => clearInterval(movementInterval);
    }, [centerPosition, isAccidentActive, isTracking]);

    const userIcon = L.icon({
        iconUrl: isAccidentActive
            ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
            : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    return (
        <div className="map-container glass-panel">
            {error && (
                <div className="location-error">
                    ⚠️ {error}
                </div>
            )}
            <MapContainer
                center={position}
                zoom={18}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", borderRadius: "16px" }}
            >
                <MapUpdater center={position} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={position} icon={userIcon}>
                    <Popup>
                        <div className="popup-content">
                            <strong>Rahul Kumar</strong>
                            <br />
                            {isAccidentActive ? (
                                <span style={{ color: 'red', fontWeight: 'bold' }}>🚨 ACCIDENT DETECTED</span>
                            ) : (
                                <span style={{ color: isTracking ? 'green' : 'orange', fontWeight: 'bold' }}>
                                    ● {isTracking ? 'LIVE GPS TRACKING' : 'DEFAULT LOCATION'}
                                </span>
                            )}
                            <br />
                            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>

            <style jsx>{`
        .map-container {
          height: calc(100vh - 140px);
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
          position: relative;
        }
        
        .location-error {
          position: absolute;
          top: 10px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 0.9rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        
        :global(.leaflet-pane) { z-index: 10; }
        :global(.leaflet-top), :global(.leaflet-bottom) { z-index: 20; }
      `}</style>
        </div>
    );
}
