# 🪖 Smart Helmet IoT System

A comprehensive IoT-based accident detection and monitoring system for smart helmets, featuring real-time sensor monitoring, automatic accident detection, emergency notifications, and a web-based dashboard.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![React Native](https://img.shields.io/badge/React_Native-0.81-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Components](#-components)
- [How It Works](#-how-it-works)
- [Technologies Used](#-technologies-used)
- [Configuration](#-configuration)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

## 🌟 Overview

The Smart Helmet IoT System is a prototype accident detection and monitoring solution that leverages mobile phone sensors (accelerometer, gyroscope, GPS) to simulate a smart helmet. The system consists of three main components:

1. **Mobile App** (Expo/React Native) - Acts as the helmet sensor
2. **Server** (Node.js/Express) - Processes sensor data and manages alerts
3. **Dashboard** (Next.js) - Monitors helmet status and displays analytics

### Use Case

When a rider wearing the smart helmet experiences an accident (detected via g-force or tilt), the system:
- Triggers a 10-second countdown for the rider to cancel the alert
- If cancelled → Logs as **low severity** (false alarm)
- If timeout → Logs as **high severity** and sends emergency notifications via email

## 🏗️ System Architecture

```
┌─────────────────┐         WebSocket          ┌─────────────────┐
│                 │◄──────────────────────────►│                 │
│  Mobile App     │    Real-time Sensor Data   │  Helmet Server  │
│  (Expo Go)      │    Accident Detection      │  (Node.js)      │
│                 │                             │                 │
└─────────────────┘                             └────────┬────────┘
        │                                                │
        │ Sensors:                                       │ WebSocket
        │ • Accelerometer                                │
        │ • Gyroscope                                    │
        │ • GPS Location                                 ▼
        │                                       ┌─────────────────┐
        │                                       │   Dashboard     │
        └──────────────────────────────────────►│   (Next.js)     │
                  QR Code Scan                  │                 │
                                                └─────────────────┘
```

## ✨ Features

### 🚨 Accident Detection
- **Dual-factor detection**: G-force (>2.5g) and Tilt (>45°)
- **Real-time sensor monitoring**: Continuous accelerometer and gyroscope data
- **Server-side validation**: Prevents false positives
- **10-second SOS countdown**: Allows riders to cancel false alarms

### 📧 Emergency Notifications
- **Automatic email alerts** for high-severity accidents
- **Detailed telemetry** including:
  - G-force measurements (X, Y, Z axes)
  - Gyroscope data (pitch, roll, yaw)
  - GPS coordinates with Google Maps link
  - Impact force and helmet tilt angle
  - Timestamp and severity level

### 📱 Mobile App Features
- Real-time sensor data streaming
- GPS location tracking
- Interactive map with accident markers
- QR code scanner for quick server connection
- Emergency cancel button with countdown timer
- Connection status indicators

### 🖥️ Dashboard Features
- **Live monitoring**: Real-time sensor data visualization
- **Interactive map**: Live GPS tracking with Leaflet
- **Safety score**: Dynamic calculation based on accident history
- **Alert management**: Filter by severity, status, and time
- **24-hour auto-deactivation**: Alerts automatically deactivate after 24 hours
- **Event history**: Complete accident log with detailed telemetry
- **Dark/Light theme**: Customizable UI theme

### 🔧 Server Features
- **WebSocket server**: Real-time bidirectional communication
- **REST API**: Access accident logs and sensor data
- **QR code generation**: Easy mobile app pairing
- **Auto-discovery**: UDP broadcasting for automatic server detection
- **Accident logging**: JSON-based persistent storage
- **Email service**: Nodemailer integration for notifications

## 📁 Project Structure

```
course-project/
├── helmet-sensor-app/          # 📱 Mobile Application (Expo/React Native)
│   ├── screens/                # UI screens (Home, Map, Settings)
│   ├── services/               # Sensor management & WebSocket client
│   ├── components/             # Reusable UI components
│   ├── App.tsx                 # Main app entry point
│   └── package.json
│
├── helmet-server/              # 💻 Backend Server (Node.js/Express)
│   ├── services/               # Business logic modules
│   │   ├── detectionService.js     # Accident detection algorithm
│   │   ├── alertService.js         # Alert classification & logging
│   │   ├── emailService.js         # Email notification service
│   │   ├── qrService.js            # QR code generation
│   │   └── discoveryService.js     # UDP auto-discovery
│   ├── logs/                   # Accident logs (JSON)
│   ├── server.js               # Main server entry point
│   ├── .env                    # Environment variables
│   └── package.json
│
├── smart-helmet-dashboard/     # 🌐 Web Dashboard (Next.js)
│   ├── app/                    # Next.js app router pages
│   │   ├── (dashboard)/        # Dashboard pages
│   │   │   ├── page.tsx            # Main dashboard
│   │   │   ├── alerts/             # Alerts page
│   │   │   ├── history/            # Event history
│   │   │   ├── notifications/      # Notifications
│   │   │   ├── map/                # Live map
│   │   │   └── settings/           # Settings
│   │   └── api/                # API routes
│   ├── components/             # React components
│   ├── context/                # State management (Context API)
│   ├── lib/                    # Utilities & data stores
│   ├── .env.local              # Environment variables
│   └── package.json
│
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ installed
- **npm** or **yarn** package manager
- **Expo Go** app on your mobile phone ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) | [iOS](https://apps.apple.com/app/expo-go/id982107779))
- **Gmail account** (for email notifications)
- **Same WiFi network** for laptop and mobile phone

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-helmet-iot.git
   cd smart-helmet-iot/course-project
   ```

2. **Install dependencies for all components**
   ```bash
   # Install server dependencies
   cd helmet-server
   npm install

   # Install mobile app dependencies
   cd ../helmet-sensor-app
   npm install

   # Install dashboard dependencies
   cd ../smart-helmet-dashboard
   npm install
   ```

3. **Configure environment variables**

   **Server** (`helmet-server/.env`):
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   PORT=3001
   ```

   **Dashboard** (`smart-helmet-dashboard/.env.local`):
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-app-password
   ```

   > **How to get Gmail App Password:**
   > 1. Go to [Google Account Settings](https://myaccount.google.com/) → Security
   > 2. Enable 2-Factor Authentication
   > 3. Go to App Passwords
   > 4. Generate a new app password for "Mail"
   > 5. Copy the 16-character password to `.env` files

### Running the System

#### Step 1: Start the Server

```bash
cd helmet-server
npm start
```

You should see:
```
🚀 Helmet Sensor Server Started
   Port: 3001
   Local IP: 192.168.1.5
   Server URL: http://192.168.1.5:3001

📡 WebSocket server ready for connections
```

**Note your laptop's IP address** (e.g., `192.168.1.5`)

#### Step 2: Start the Dashboard

```bash
cd smart-helmet-dashboard
npm run dev
```

Open browser: [http://localhost:3000](http://localhost:3000)

#### Step 3: Start the Mobile App

```bash
cd helmet-sensor-app
npm start
```

1. Scan the QR code with **Expo Go** app on your phone
2. In the mobile app, enter: `http://YOUR_LAPTOP_IP:3001`
3. Tap **"Connect to Server"**
4. Tap **"Start Monitoring"**

### Testing the System

1. **Drop Test**: Drop your phone on a soft surface (bed/couch) from 30cm
2. **Tilt Test**: Quickly tilt your phone >45°
3. **Watch the alert appear** on mobile app with 10-second countdown
4. **Options**:
   - Press **"I'M OKAY"** → Logs as low severity (false alarm)
   - Let timer expire → Logs as high severity + sends email notification
5. **View results** on the dashboard

## 🔧 Components

### 1. Mobile App (`helmet-sensor-app`)

**Technology**: Expo SDK 54, React Native 0.81, TypeScript

**Key Features**:
- Real-time sensor data collection (accelerometer, gyroscope)
- GPS location tracking
- WebSocket client for server communication
- QR code scanner for easy server pairing
- Emergency alert UI with countdown timer
- Interactive map view

**Main Files**:
- `App.tsx` - Main application entry point
- `screens/HomeScreen.tsx` - Main monitoring screen
- `services/sensorService.ts` - Sensor data management
- `services/websocketService.ts` - WebSocket client

**Run Commands**:
```bash
npm start          # Start Expo development server
npm run android    # Run on Android device/emulator
npm run ios        # Run on iOS device/simulator
```

### 2. Server (`helmet-server`)

**Technology**: Node.js, Express, Socket.io, Nodemailer

**Key Features**:
- WebSocket server for real-time communication
- Accident detection algorithm
- Alert classification and logging
- Email notification service
- QR code generation for mobile pairing
- UDP auto-discovery broadcasting
- REST API for data access

**Main Files**:
- `server.js` - Main server entry point
- `services/detectionService.js` - Accident detection logic
- `services/alertService.js` - Alert classification
- `services/emailService.js` - Email notifications
- `logs/accidents.json` - Accident history

**API Endpoints**:
- `GET /` - Server status
- `GET /api/accidents` - Accident logs
- `GET /api/sensor-data` - Current sensor data
- `GET /api/location` - Current GPS location
- `GET /api/qr-code` - QR code for mobile pairing

**Run Commands**:
```bash
npm start          # Start server on port 3001
```

### 3. Dashboard (`smart-helmet-dashboard`)

**Technology**: Next.js 16, React 19, TypeScript, Leaflet

**Key Features**:
- Real-time sensor data visualization
- Interactive GPS tracking map
- Safety score calculation
- Alert management with filters
- Event history with detailed telemetry
- Email notification configuration
- Dark/Light theme support

**Main Files**:
- `app/(dashboard)/page.tsx` - Main dashboard
- `app/(dashboard)/alerts/page.tsx` - Alerts management
- `app/(dashboard)/history/page.tsx` - Event history
- `components/Map.tsx` - Interactive map component
- `context/AccidentContext.tsx` - State management

**Run Commands**:
```bash
npm run dev        # Start development server (port 3000)
npm run build      # Build for production
npm start          # Start production server
```

## ⚙️ How It Works

### Accident Detection Flow

```
1. Mobile App collects sensor data (accelerometer, gyroscope, GPS)
   ↓
2. Continuous monitoring for anomalies:
   - G-Force > 2.5g
   - Tilt > 45°
   ↓
3. If anomaly detected → Send to Server via WebSocket
   ↓
4. Server validates detection using dual-factor algorithm
   ↓
5. If confirmed → Server sends 'accident_confirmed' to Mobile
   ↓
6. Mobile displays 10-second countdown alert
   ↓
7. User Response:
   ├─ Cancel within 10s → Send 'accident_cancelled' to Server
   │                      → Server logs as FALSE_ALARM (low severity)
   │
   └─ Timeout (no response) → Send 'no_response' to Server
                             → Server logs as HIGH severity
                             → Server broadcasts to Dashboard
                             → Dashboard sends emergency email
   ↓
8. Dashboard updates in real-time:
   - Alert count
   - Safety score
   - Event history
   - Live map
```

### Detection Thresholds

| Parameter | Threshold | Description |
|-----------|-----------|-------------|
| **G-Force** | > 2.5g | Total acceleration magnitude |
| **Tilt** | > 45° | Helmet angle from vertical |
| **Timeout** | 10 seconds | Time to cancel alert |
| **Alert Deactivation** | 24 hours | Auto-deactivation time |

### Severity Classification

| Severity | Condition | Action |
|----------|-----------|--------|
| **Low** | User cancelled within 10s | Log as false alarm |
| **High** | No response (timeout) | Send emergency email notification |

## 🛠️ Technologies Used

### Mobile App
- **Expo SDK** 54 - React Native framework
- **React Native** 0.81 - Mobile UI framework
- **TypeScript** 5 - Type-safe JavaScript
- **expo-sensors** - Accelerometer & Gyroscope
- **expo-location** - GPS tracking
- **react-native-maps** - Map visualization
- **socket.io-client** - WebSocket client
- **expo-barcode-scanner** - QR code scanning

### Server
- **Node.js** 18+ - JavaScript runtime
- **Express** 5 - Web framework
- **Socket.io** 4 - WebSocket server
- **Nodemailer** 7 - Email service
- **QRCode** - QR code generation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Dashboard
- **Next.js** 16 - React framework
- **React** 19 - UI library
- **TypeScript** 5 - Type-safe JavaScript
- **Leaflet** - Interactive maps
- **react-leaflet** - React wrapper for Leaflet
- **Chart.js** - Data visualization
- **Lucide React** - Icon library
- **React Hot Toast** - Notifications
- **Socket.io Client** - WebSocket client

## 🔐 Configuration

### Email Notifications

Both the server and dashboard require Gmail credentials for sending email notifications.

**Setup Steps**:
1. Create or use an existing Gmail account
2. Enable 2-Factor Authentication
3. Generate an App Password:
   - Go to [Google Account](https://myaccount.google.com/) → Security
   - Click "App passwords"
   - Select "Mail" and generate
   - Copy the 16-character password
4. Add to `.env` files:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### Notification Recipients

Edit `smart-helmet-dashboard/app/api/simulate-accident/route.ts`:
```typescript
to: "emergency-contact@example.com"  // Line 79
```

### Server Port

Default port is `3001`. To change:

**Option 1**: Edit `helmet-server/.env`
```env
PORT=3002
```

**Option 2**: Set environment variable
```bash
PORT=3002 npm start
```

### Alert Auto-Deactivation Time

Edit `smart-helmet-dashboard/lib/accidents-store.ts`:
```typescript
const isActive = hoursSinceAccident < 24;  // Change 24 to desired hours
```

## 🧪 Testing

### Test Scenarios

| Test | Action | Expected Result |
|------|--------|-----------------|
| **Drop Test** | Drop phone on bed from 30cm | Alert appears (g-force spike) |
| **Tilt Test** | Quickly tilt phone >45° | Alert appears (tilt detected) |
| **Cancel Test** | Press "I'M OKAY" button | Logged as FALSE_ALARM (low severity) |
| **Timeout Test** | Don't press button (10s) | Logged as HIGH severity + email sent |
| **Dashboard Test** | Check dashboard after accident | Alert count updates, event in history |
| **Map Test** | View map page | Location marker appears |

### Viewing Logs

**Browser**:
```
http://localhost:3001/api/accidents
```

**File**:
```
helmet-server/logs/accidents.json
```

**Example Log Entry**:
```json
{
  "detected": true,
  "reason": "G_FORCE",
  "severity": "HIGH",
  "timestamp": 1703234567890,
  "sensorData": {
    "gForce": 3.2,
    "tilt": 50.5,
    "location": {
      "latitude": 12.34,
      "longitude": 56.78
    }
  },
  "userResponse": "NO_RESPONSE",
  "loggedAt": "2025-12-22T09:42:47.890Z"
}
```

## 🐛 Troubleshooting

### Mobile App Can't Connect to Server

**Symptoms**: Connection error, "Server not found"

**Solutions**:
- ✅ Verify both devices are on the **same WiFi network**
- ✅ Check server is running (`npm start` in `helmet-server`)
- ✅ Use laptop's **IP address**, not `localhost`
- ✅ Check firewall settings (allow port 3001)
- ✅ Disable VPN on laptop or phone

**Find your laptop IP**:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
# or
ip addr
```

### Alert Not Appearing

**Symptoms**: No alert after drop/tilt

**Solutions**:
- ✅ Try harder drop or more aggressive tilt
- ✅ Check server console for detection logs
- ✅ Verify thresholds: G-Force > 2.5g, Tilt > 45°
- ✅ Ensure "Start Monitoring" is active

### Port Already in Use

**Symptoms**: `Error: listen EADDRINUSE: address already in use :::3001`

**Solutions**:

**Windows**:
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace <PID> with actual process ID)
taskkill /PID <PID> /F
```

**Mac/Linux**:
```bash
# Find and kill process
lsof -ti:3001 | xargs kill -9
```

### Email Not Sending

**Symptoms**: No email received after high-severity accident

**Solutions**:
- ✅ Verify `.env` files have correct Gmail credentials
- ✅ Ensure App Password is used (not regular password)
- ✅ Check recipient email address in dashboard code
- ✅ Check spam/junk folder
- ✅ Review server console for email errors

### Dashboard Not Updating

**Symptoms**: Dashboard doesn't show new accidents

**Solutions**:
- ✅ Refresh browser page
- ✅ Check browser console for errors
- ✅ Verify WebSocket connection to server
- ✅ Ensure server is broadcasting events

### QR Code Not Scanning

**Symptoms**: Mobile app can't scan QR code

**Solutions**:
- ✅ Grant camera permissions to Expo Go
- ✅ Ensure good lighting
- ✅ Manually enter server URL: `http://YOUR_IP:3001`

## 🚀 Future Enhancements

### Planned Features
- [ ] **Database Integration**: PostgreSQL/MongoDB for persistent storage
- [ ] **User Authentication**: Multi-user support with login system
- [ ] **SMS Notifications**: Twilio integration for SMS alerts
- [ ] **Telegram Bot**: Instant messaging notifications
- [ ] **Real Hardware**: Integration with actual smart helmet sensors
- [ ] **Machine Learning**: Improved accident detection using ML models
- [ ] **Geofencing**: Location-based alerts and restrictions
- [ ] **Emergency Services API**: Direct integration with 911/emergency services
- [ ] **Ride Analytics**: Trip tracking, speed monitoring, route history
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Offline Mode**: Local storage and sync when online
- [ ] **Wearable Integration**: Apple Watch, Fitbit compatibility

### Potential Improvements
- [ ] Battery optimization for mobile app
- [ ] Improved sensor calibration
- [ ] Custom alert thresholds per user
- [ ] Voice commands for hands-free operation
- [ ] Integration with insurance companies
- [ ] Social features (share rides, leaderboards)

## 📄 License

This project is created for educational purposes as part of an IoT course project.

**MIT License** - Feel free to use, modify, and distribute with attribution.

## 👤 Author

**Simran Kalkeri**
- GitHub: [@simran-kalkeri](https://github.com/simran-kalkeri)
- Email: simrankalkeri@gmail.com

## 🙏 Acknowledgments

- Built with **Expo**, **React Native**, **Node.js**, and **Next.js**
- Icons by **Lucide React**
- Maps by **Leaflet** and **React Leaflet**
- Email service by **Nodemailer**
- Inspired by real-world smart helmet safety systems

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs/)
- [Leaflet Documentation](https://leafletjs.com/)

---

**Made with ❤️ for Rider Safety**

*If this project helped you, please give it a ⭐ on GitHub!*
