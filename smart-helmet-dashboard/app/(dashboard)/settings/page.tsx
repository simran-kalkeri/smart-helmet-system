"use client";

import { Save, Bell, User, Phone, Map } from "lucide-react";

export default function SettingsPage() {
  // Mock settings state
  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>My Settings</h1>
        <p>Manage your preferences and emergency contacts.</p>
      </div>

      <div className="settings-grid">
        {/* Emergency Contacts - Link or Inline */}
        <div className="settings-card glass-panel">
          <div className="card-header">
            <Phone size={20} />
            <h3>Emergency Contacts</h3>
          </div>
          <p className="card-desc">Manage who to contact in case of an emergency.</p>
          <a href="/profile" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Manage in Profile
          </a>
        </div>

        {/* System Preferences */}
        <div className="settings-card glass-panel">
          <div className="card-header">
            <Bell size={20} />
            <h3>Notification Preferences</h3>
          </div>

          <div className="toggle-list">
            <div className="toggle-item">
              <span>Receive SMS Alerts</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-item">
              <span>Receive Email Reports</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
            <div className="toggle-item">
              <span>WhatsApp Updates</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Location Privacy */}
        <div className="settings-card glass-panel">
          <div className="card-header">
            <Map size={20} />
            <h3>Location Sharing</h3>
          </div>
          <p className="card-desc">Your location is shared with emergency services when an impact is detected.</p>

          <div className="toggle-item">
            <span>Live Location Sharing</span>
            <label className="switch">
              <input type="checkbox" defaultChecked disabled />
              <span className="slider round"></span>
            </label>
          </div>
          <small style={{ color: '#94a3b8', marginTop: 10, display: 'block' }}>* Required for system functionality</small>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          padding-bottom: 40px;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 24px;
        }

        .settings-card {
          padding: 24px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          color: var(--primary);
        }

        .card-desc {
          font-size: 0.9rem;
          color: var(--secondary-text, #94a3b8);
          margin-bottom: 20px;
        }

        .toggle-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .toggle-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .btn-outline {
           padding: 8px 16px;
           border: 1px solid var(--primary);
           color: var(--primary);
           border-radius: 8px;
           text-decoration: none;
           font-size: 0.9rem;
           transition: all 0.2s;
        }
        
        .btn-outline:hover {
           background: rgba(59, 130, 246, 0.1);
        }

        /* Switch CSS */
        .switch {
          position: relative;
          display: inline-block;
          width: 48px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .4s;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
        }

        input:checked + .slider {
          background-color: var(--primary);
        }

        input:checked + .slider:before {
          transform: translateX(24px);
        }
        
        input:disabled + .slider {
           opacity: 0.5;
           cursor: not-allowed;
        }

        .slider.round {
          border-radius: 34px;
        }

        .slider.round:before {
          border-radius: 50%;
        }
      `}</style>
    </div>
  );
}
