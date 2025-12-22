"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: string;
  location: string;
  channels: {
    email: { sent: boolean; recipient?: string };
    sms: { sent: boolean; reason?: string };
    telegram: { sent: boolean; reason?: string };
  };
};

const StatusIcon = ({ sent }: { sent: boolean }) => {
  if (sent) return <CheckCircle size={18} className="text-success" />;
  return <XCircle size={18} className="text-muted" />;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notification Logs</h1>
        <p>Track delivery status of emergency alerts across all channels.</p>
      </div>

      {loading ? (
        <div className="loading-state glass-panel">Loading notifications...</div>
      ) : (
        <div className="table-container glass-panel">
          <table>
            <thead>
              <tr>
                <th>Event Details</th>
                <th>Email</th>
                <th>SMS</th>
                <th>Telegram</th>
              </tr>
            </thead>
            <tbody>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <tr key={notif.id}>
                    <td>
                      <div className="event-context">
                        <span className="event-id">{notif.id}</span>
                        <span className="event-title">{notif.title}</span>
                        <span className="time">{notif.timestamp}</span>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <StatusIcon sent={notif.channels.email.sent} />
                        {notif.channels.email.sent ? (
                          <div className="status-details">
                            <span className="status-text sent">Sent</span>
                            <span className="recipient-info">{notif.channels.email.recipient}</span>
                          </div>
                        ) : (
                          <span className="status-text failed">Failed</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <StatusIcon sent={notif.channels.sms.sent} />
                        <div className="status-details">
                          <span className={`status-text ${notif.channels.sms.sent ? 'sent' : 'not-configured'}`}>
                            {notif.channels.sms.sent ? 'Sent' : 'Not Configured'}
                          </span>
                          {!notif.channels.sms.sent && (
                            <span className="config-hint">{notif.channels.sms.reason}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="status-cell">
                        <StatusIcon sent={notif.channels.telegram.sent} />
                        <div className="status-details">
                          <span className={`status-text ${notif.channels.telegram.sent ? 'sent' : 'not-configured'}`}>
                            {notif.channels.telegram.sent ? 'Sent' : 'Not Configured'}
                          </span>
                          {!notif.channels.telegram.sent && (
                            <span className="config-hint">{notif.channels.telegram.reason}</span>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No notifications yet. Trigger an accident to see notification logs.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <style jsx>{`
        .notifications-page {
          padding-bottom: 40px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .page-header p {
          color: var(--secondary-text, #94a3b8);
        }

        .table-container {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 16px 20px;
          background: rgba(255, 255, 255, 0.03);
          color: var(--secondary-text, #94a3b8);
          font-weight: 600;
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--card-border);
          color: var(--secondary-text, #cbd5e1);
        }

        .event-context {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .event-id {
          font-family: monospace;
          color: var(--primary);
          font-weight: 500;
        }

        .event-title {
          font-size: 0.9rem;
          color: var(--foreground);
        }

        .time {
          font-size: 0.8rem;
          color: #64748b;
        }

        .status-cell {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .status-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .status-text {
          font-weight: 500;
          text-transform: capitalize;
        }

        .status-text.sent {
          color: var(--success);
        }

        .status-text.failed {
          color: var(--danger);
        }

        .status-text.not-configured {
          color: #64748b;
        }

        .recipient-info {
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
        }

        .config-hint {
          font-size: 0.75rem;
          color: #64748b;
          font-style: italic;
        }

        .text-success {
          color: var(--success);
        }

        .text-muted {
          color: #64748b;
        }

        .loading-state,
        .empty-state {
          padding: 40px;
          text-align: center;
          color: var(--secondary-text);
        }
      `}</style>
    </div>
  );
}
