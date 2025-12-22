export const ALERTS = [
    {
        id: "1",
        riderName: "Rahul Kumar",
        helmetId: "SH-2024-001",
        timestamp: "10:45 AM, Today",
        location: "MG Road, Sector 14, Gurgaon",
        severity: "high",
        isCancelled: false,
    },
    {
        id: "2",
        riderName: "Priya Singh",
        helmetId: "SH-2024-042",
        timestamp: "10:30 AM, Today",
        location: "Cyber Hub, DLF Phase 2",
        severity: "low",
        isCancelled: true,
    },
    {
        id: "3",
        riderName: "Amit Sharma",
        helmetId: "SH-2024-089",
        timestamp: "09:15 AM, Today",
        location: "Golf Course Road",
        severity: "medium",
        isCancelled: false,
    },
    {
        id: "4",
        riderName: "Vikram Malhotra",
        helmetId: "SH-2024-112",
        timestamp: "Yesterday, 11:20 PM",
        location: "NH-8 Near Airport",
        severity: "high",
        isCancelled: false,
    },
];

export const RIDERS = [
    { id: 1, name: "Rahul Kumar", contact: "+91 98765 43210", helmetId: "SH-001", lastSeen: "Active now", battery: 85, status: "active" },
    { id: 2, name: "Priya Singh", contact: "+91 98989 89898", helmetId: "SH-042", lastSeen: "Active now", battery: 92, status: "active" },
    { id: 3, name: "Amit Sharma", contact: "+91 87654 32109", helmetId: "SH-089", lastSeen: "2h ago", battery: 45, status: "offline" },
    { id: 4, name: "Vikram Malhotra", contact: "+91 76543 21098", helmetId: "SH-112", lastSeen: "5h ago", battery: 12, status: "offline" },
    { id: 5, name: "Suresh Raina", contact: "+91 65432 10987", helmetId: "SH-156", lastSeen: "1d ago", battery: 0, status: "offline" },
];

export const HISTORY = [
    { id: "EVT-001", rider: "Rahul Kumar", deviceId: "SH-001", time: "2024-12-06 10:45", gps: "28.45, 77.02", impact: 85, forwarded: true, cancelled: false },
    { id: "EVT-002", rider: "Priya Singh", deviceId: "SH-042", time: "2024-12-06 10:30", gps: "28.45, 77.08", impact: 12, forwarded: false, cancelled: true },
    { id: "EVT-003", rider: "Amit Sharma", deviceId: "SH-089", time: "2024-12-05 14:20", gps: "28.47, 77.04", impact: 45, forwarded: true, cancelled: false },
];
