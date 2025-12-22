"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="map-loading glass-panel">
            <p>Initializing Map System...</p>
            <style jsx>{`
        .map-loading {
          height: calc(100vh - 140px);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 1.2rem;
        }
      `}</style>
        </div>
    )
});

export default function MapPage() {
    return (
        <div className="map-page">
            <div className="page-header">
                <h1>Live Tracking</h1>
                <p>Real-time GPS locations of all active helmets.</p>
            </div>

            <MapView />

            <style jsx>{`
        .map-page {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-size: 1.8rem;
          margin-bottom: 4px;
        }

        .page-header p {
          color: #94a3b8;
        }
      `}</style>
        </div>
    );
}
