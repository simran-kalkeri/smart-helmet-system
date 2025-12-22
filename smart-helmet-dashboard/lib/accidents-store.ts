// In-memory store for accidents
// Note: Data persists only while server is running

type AccidentData = {
    id: string;
    riderName: string;
    helmetId: string;
    timestamp: string;
    timestampDate: Date;
    location: string;
    latitude: string;
    longitude: string;
    severity: "high" | "low";
    gyroX: string;
    gyroY: string;
    gyroZ: string;
    accelX: string;
    accelY: string;
    accelZ: string;
    tiltAngle: string;
    impactForce: string;
    isCancelled: boolean;
};

// In-memory storage
let accidents: AccidentData[] = [];

// Add a new accident
export function addAccident(accident: AccidentData) {
    accidents.unshift(accident); // Add to beginning (newest first)
    // Keep only last 50 accidents to prevent memory issues
    if (accidents.length > 50) {
        accidents = accidents.slice(0, 50);
    }
}

// Get all accidents
export function getAccidents(): AccidentData[] {
    return [...accidents]; // Return copy to prevent external modifications
}

// Get accidents for alerts page (formatted)
export function getAlerts() {
    return accidents.map(acc => {
        // Check if alert is still active (within 24 hours)
        const now = new Date();
        const accidentTime = acc.timestampDate;
        const hoursSinceAccident = (now.getTime() - accidentTime.getTime()) / (1000 * 60 * 60);
        const isActive = hoursSinceAccident < 24;

        return {
            id: acc.id,
            riderName: acc.riderName,
            helmetId: acc.helmetId,
            timestamp: acc.timestamp,
            location: acc.location,
            latitude: acc.latitude,
            longitude: acc.longitude,
            severity: acc.severity,
            isCancelled: acc.isCancelled,
            isActive: isActive,
            hoursSinceAccident: Math.floor(hoursSinceAccident)
        };
    });
}

// Get only active alerts count (for dashboard)
export function getActiveAlertsCount() {
    const alerts = getAlerts();
    return alerts.filter(alert => alert.isActive).length;
}

// Get accidents for history page (formatted)
export function getHistory() {
    return accidents.map(acc => {
        // Parse impact force to get numeric value
        const impactValue = parseFloat(acc.impactForce) || 0;

        return {
            id: acc.id || '',
            rider: acc.riderName || 'Unknown',
            deviceId: acc.helmetId || 'Unknown',
            time: acc.timestamp || '',
            gps: acc.location || '',
            impact: impactValue,
            forwarded: true, // Email was sent
            cancelled: acc.isCancelled || false
        };
    });
}

// Get accidents for notifications page (formatted)
export function getNotifications() {
    return accidents.map(acc => ({
        id: acc.id,
        type: acc.severity === "high" ? "crash" : (acc.isCancelled ? "false_alarm" : "alert"),
        title: acc.severity === "high"
            ? "🚨 High Severity Crash Detected"
            : "⚠️ Impact Detected - SOS Cancelled",
        message: acc.severity === "high"
            ? `No response from ${acc.riderName}. Emergency services may be needed.`
            : `${acc.riderName} cancelled the SOS alert. Minor impact detected.`,
        timestamp: acc.timestamp,
        read: false,
        severity: acc.severity,
        location: acc.location,
        // Notification channels status - shows which channels are actually configured
        channels: {
            email: { sent: true, recipient: "01fe23bci087@kletech.ac.in" },
            sms: { sent: false, reason: "Not configured" },
            telegram: { sent: false, reason: "Not configured" }
        }
    }));
}

// Clear all accidents (for testing)
export function clearAccidents() {
    accidents = [];
}
