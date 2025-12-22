# 🖥️ Helmet Sensor Server

Node.js server that receives sensor data from mobile app, validates accident detection, and manages alerts.

## Features

- **WebSocket Server**: Real-time communication with mobile app
- **Dual-Factor Detection**: Validates g-force and tilt thresholds
- **Alert Classification**: 
  - `FALSE_ALARM`: User cancelled within 10s
  - `HIGH`: No response (emergency)
- **Accident Logging**: JSON logs stored in `logs/accidents.json`
- **REST API**: View accident history

## Prerequisites

- Node.js 18+ installed
- Laptop and phone on same WiFi network

## Installation

```bash
# Install dependencies
npm install
```

## Usage

### Start the Server

```bash
npm start
```

You should see:
```
🚀 Helmet Sensor Server Started
   Port: 3001
   Server URL: http://localhost:3001

📡 WebSocket server ready for connections
   Mobile app should connect to: http://<your-laptop-ip>:3001

🔍 Detection Thresholds:
   G-Force: > 2.5g
   Tilt: > 45°
```

### Find Your Laptop IP

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., `192.168.1.5`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### View Accident Logs

**Browser:**
```
http://localhost:3001/api/accidents
```

**File:**
```
logs/accidents.json
```

## API Endpoints

### GET `/`
Server status and info
```json
{
  "message": "Helmet Sensor Server",
  "status": "running",
  "connectedClients": 1,
  "endpoints": {
    "accidents": "/api/accidents"
  }
}
```

### GET `/api/accidents`
List all accident logs
```json
{
  "total": 5,
  "accidents": [
    {
      "detected": true,
      "reason": "G_FORCE",
      "severity": "FALSE_ALARM",
      "timestamp": 1703234567890,
      "sensorData": {
        "gForce": 3.2,
        "tilt": 12.5
      },
      "userResponse": "CANCELLED",
      "loggedAt": "2025-12-22T09:42:47.890Z"
    }
  ]
}
```

## WebSocket Events

### Client → Server

**`accident_detected`**
```javascript
{
  gForce: 3.2,
  tilt: 50.5,
  timestamp: 1703234567890,
  location: { latitude: 12.34, longitude: 56.78 }
}
```

**`accident_cancelled`**
User pressed cancel button

**`no_response`**
10-second timeout reached

### Server → Client

**`accident_confirmed`**
Server validated detection, mobile should show alert

## Detection Logic

```javascript
// Dual-factor detection
const isGForceAnomaly = gForce > 2.5;
const isTiltAnomaly = Math.abs(tilt) > 45;

if (isGForceAnomaly || isTiltAnomaly) {
  // Accident detected
}
```

## Project Structure

```
helmet-server/
├── server.js                    # Main server entry
├── services/
│   ├── detectionService.js      # Accident detection logic
│   └── alertService.js          # Alert classification & logging
└── logs/
    └── accidents.json           # Accident history (auto-created)
```

## Console Output Examples

### Client Connected
```
✅ Client connected: abc123
   Total clients: 1
```

### Accident Detected
```
📱 Received accident alert from client: abc123
   Data: { gForce: 3.2, tilt: 50.5, ... }

🚨 ACCIDENT DETECTED!
  Reason: TILT
  G-Force: 3.20g ✓
  Tilt: 50.50° ⚠️ EXCEEDED
  Timestamp: 12/22/2025, 3:42:47 PM
  Location: N/A

   ✅ Accident confirmed - alert sent to mobile
```

### User Cancelled
```
📱 Received cancel response from client: abc123

✅ ACCIDENT CANCELLED
  User is conscious and responded
  Severity: FALSE_ALARM

📝 Accident logged to: logs/accidents.json
   ✅ Accident marked as FALSE_ALARM
```

### No Response (Emergency)
```
📱 Received no response (timeout) from client: abc123

🚨 HIGH SEVERITY ACCIDENT
  User did not respond within timeout
  Severity: HIGH
  ⚠️ EMERGENCY SERVICES SHOULD BE NOTIFIED

📝 Accident logged to: logs/accidents.json
   🚨 Accident marked as HIGH SEVERITY
   ⚠️ In production: Trigger emergency alerts here
```

## Troubleshooting

**Port already in use:**
```bash
# Change port in server.js or set environment variable
PORT=3002 npm start
```

**Mobile can't connect:**
- Verify server is running
- Check firewall settings (allow port 3001)
- Ensure both devices on same WiFi
- Try laptop IP instead of localhost

**No logs appearing:**
- Check `logs/` directory exists
- Verify write permissions
- Check console for errors

## Next Steps

- [ ] Add email/SMS notifications for HIGH severity
- [ ] Implement authentication
- [ ] Add database instead of JSON files
- [ ] Create admin dashboard
- [ ] Add geofencing alerts
- [ ] Integrate with emergency services API

## Tech Stack

- Node.js
- Express
- Socket.io (WebSocket)
- CORS
