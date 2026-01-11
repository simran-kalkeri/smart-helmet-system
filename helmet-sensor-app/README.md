# 🪖 Helmet Sensor App

Mobile application prototype that uses phone sensors (accelerometer & gyroscope) to detect accidents and communicate with a laptop server.

## Features

- **Real-time Sensor Monitoring**: Tracks g-force and tilt angle
- **Dual-Factor Detection**: 
  - G-Force threshold: > 2.5g
  - Tilt threshold: > 45°
- **WebSocket Communication**: Real-time connection to laptop server
- **Emergency Alert UI**: 10-second countdown with cancel button
- **Live Data Display**: View sensor readings in real-time

## Prerequisites:

- Node.js 18+ installed
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- Phone and laptop on the same WiFi network

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

## Usage

### 1. Start the Server
First, start the laptop server (see `helmet-server` README)

### 2. Find Your Laptop's IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi adapter (e.g., `192.168.1.5`)

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### 3. Run the Mobile App

```bash
npm start
```

Scan the QR code with:
- **iOS**: Camera app
- **Android**: Expo Go app

### 4. Connect to Server

1. Open the app on your phone
2. Enter your laptop's IP in the format: `http://192.168.1.x:3001`
3. Tap "Connect to Server"
4. Wait for "Connected" status
5. Tap "Start Monitoring"

## Testing Scenarios

### Test 1: Drop Phone (G-Force Detection)
1. Start monitoring
2. Drop phone onto a soft surface (bed/couch) from ~30cm
3. Expected: Alert should appear

### Test 2: Tilt Detection
1. Start monitoring
2. Hold phone flat, then quickly tilt >45°
3. Expected: Alert should appear

### Test 3: Cancel Button
1. Trigger an alert
2. Press "I'M OKAY - CANCEL ALERT" within 10 seconds
3. Expected: Server logs "FALSE_ALARM"

### Test 4: Timeout
1. Trigger an alert
2. Do NOT press the button
3. Wait for countdown to reach 0
4. Expected: Server logs "HIGH" severity

## Project Structure

```
helmet-sensor-app/
├── App.tsx                    # Main app entry
├── screens/
│   └── SensorScreen.tsx       # Main sensor monitoring screen
├── services/
│   ├── sensorService.ts       # Accelerometer/gyroscope handling
│   └── socketService.ts       # WebSocket communication
└── components/
    ├── MapPlaceholder.tsx     # Static map UI
    └── CancelButton.tsx       # Emergency alert overlay
```

## Troubleshooting

**"Socket not connected" error:**
- Verify laptop server is running
- Check that phone and laptop are on same WiFi
- Ensure IP address is correct
- Try restarting both server and app

**Sensors not working:**
- Expo Go app has sensor permissions
- Try restarting the app
- Check device has accelerometer/gyroscope (most modern phones do)

**Alert not appearing:**
- Check server console for detection logs
- Verify thresholds are being exceeded
- Try more forceful drop or tilt

## Tech Stack

- React Native + Expo
- TypeScript
- expo-sensors (Accelerometer, Gyroscope)
- Socket.io-client (WebSocket)

## Next Steps

- [ ] Add GPS location tracking
- [ ] Implement live map with user location
- [ ] Add battery level monitoring
- [ ] Persist connection settings
- [ ] Add notification sounds/vibration
