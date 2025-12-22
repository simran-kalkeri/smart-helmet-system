const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { detectAccident } = require('./services/detectionService');
const { classifyAccident, getAccidentLogs } = require('./services/alertService');
const { displayQRCode, generateQRCodeDataURL, getLocalIPAddress } = require('./services/qrService');
const { startBroadcasting } = require('./services/discoveryService');
const { sendAccidentEmail } = require('./services/emailService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for development
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Store active accidents per client
const activeAccidents = new Map();

// Store current sensor data and location
let currentSensorData = null;
let currentLocation = null;

// Track last accident time per client to prevent duplicates
const lastAccidentTime = new Map();

// REST API endpoint to view logs
app.get('/api/accidents', (req, res) => {
    const logs = getAccidentLogs();
    res.json({
        total: logs.length,
        accidents: logs,
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'Helmet Sensor Server',
        status: 'running',
        connectedClients: io.engine.clientsCount,
        serverIP: getLocalIPAddress(),
        endpoints: {
            accidents: '/api/accidents',
            sensorData: '/api/sensor-data',
            location: '/api/location',
            qrCode: '/api/qr-code',
        },
    });
});

// API endpoint to get current sensor data
app.get('/api/sensor-data', (req, res) => {
    res.json({
        data: currentSensorData,
        timestamp: Date.now(),
    });
});

// API endpoint to get current location
app.get('/api/location', (req, res) => {
    res.json({
        location: currentLocation,
        timestamp: Date.now(),
    });
});

// API endpoint to get QR code
app.get('/api/qr-code', async (req, res) => {
    const qrCodeDataURL = await generateQRCodeDataURL(PORT);
    res.json({
        qrCode: qrCodeDataURL,
        serverUrl: `http://${getLocalIPAddress()}:${PORT}`,
    });
});

// WebSocket connection handling
io.on('connection', (socket) => {
    console.log('\n✅ Client connected:', socket.id);
    console.log(`   Total clients: ${io.engine.clientsCount}`);

    // Handle accident detection from mobile
    socket.on('accident_detected', (data) => {
        console.log('\n📱 Received accident alert from client:', socket.id);
        console.log('   Data:', data);

        // Check if this is a duplicate (within 30 seconds of last accident)
        const now = Date.now();
        const lastTime = lastAccidentTime.get(socket.id) || 0;

        if (now - lastTime < 30000) {
            console.log('   ⏭️ Duplicate accident ignored (within 30s)');
            return;
        }

        // Update last accident time
        lastAccidentTime.set(socket.id, now);

        // Validate detection on server side
        const detectionResult = detectAccident(data);

        if (detectionResult.detected) {
            // Store accident data for this client
            activeAccidents.set(socket.id, detectionResult);

            // Confirm accident to mobile (triggers cancel button)
            socket.emit('accident_confirmed');

            // Broadcast to all other clients (including dashboard) - ONLY ONCE
            socket.broadcast.emit('accident_detected', {
                gForce: data.gForce,
                tilt: data.tilt,
                timestamp: data.timestamp,
                location: data.location,
                clientId: socket.id,
            });

            console.log('   ✅ Accident confirmed - alert sent to mobile and dashboard');
        } else {
            console.log('   ❌ Server validation failed - not an accident');
        }
    });

    // Handle cancel button press
    socket.on('accident_cancelled', () => {
        console.log('\n📱 Received cancel response from client:', socket.id);

        const accidentData = activeAccidents.get(socket.id);
        if (accidentData) {
            // Classify as FALSE_ALARM
            const classified = classifyAccident(accidentData, 'CANCELLED');

            // Broadcast cancellation to dashboard
            socket.broadcast.emit('accident_cancelled', {
                clientId: socket.id,
                severity: 'low'
            });

            // Clean up
            activeAccidents.delete(socket.id);
            lastAccidentTime.delete(socket.id);

            console.log('   ✅ Accident marked as FALSE_ALARM');
        }
    });

    // Handle timeout (no response)
    socket.on('no_response', () => {
        console.log('\n📱 Received no response (timeout) from client:', socket.id);

        const accidentData = activeAccidents.get(socket.id);
        if (accidentData) {
            // Classify as HIGH severity
            const classified = classifyAccident(accidentData, 'NO_RESPONSE');

            // Broadcast timeout to dashboard for email notification
            socket.broadcast.emit('accident_timeout', {
                clientId: socket.id,
                severity: 'high',
                accidentData: classified
            });

            // Clean up
            activeAccidents.delete(socket.id);
            lastAccidentTime.delete(socket.id);

            console.log('   🚨 Accident marked as HIGH SEVERITY');
            console.log('   ⚠️ In production: Trigger emergency alerts here');
        }
    });

    // Handle sensor data streaming
    socket.on('sensor_data', (data) => {
        currentSensorData = data;
        // Broadcast to all other connected clients (including dashboard)
        socket.broadcast.emit('sensor_data', data);
    });

    // Handle location updates
    socket.on('location_update', (location) => {
        currentLocation = location;
        // Broadcast to all other connected clients (including dashboard)
        socket.broadcast.emit('location_update', location);
    });

    // Handle email notification request from mobile app
    socket.on('send_email_notification', async (data) => {
        console.log('\n📧 Email notification requested from client:', socket.id);
        console.log('   Accident data:', data);

        try {
            const result = await sendAccidentEmail(data);
            if (result.success) {
                console.log('   ✅ Email sent successfully');
                socket.emit('email_sent', { success: true });
            } else {
                console.log('   ❌ Email send failed:', result.reason || result.error);
                socket.emit('email_sent', { success: false, error: result.reason || result.error });
            }
        } catch (error) {
            console.error('   ❌ Email error:', error.message);
            socket.emit('email_sent', { success: false, error: error.message });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('\n❌ Client disconnected:', socket.id);
        console.log(`   Total clients: ${io.engine.clientsCount}`);

        // Clean up any active accidents for this client
        activeAccidents.delete(socket.id);
    });
});

// Start server
server.listen(PORT, () => {
    console.log('\n🚀 Helmet Sensor Server Started');
    console.log(`   Port: ${PORT}`);
    console.log(`   Local IP: ${getLocalIPAddress()}`);
    console.log(`   Server URL: http://${getLocalIPAddress()}:${PORT}`);
    console.log('\n📡 WebSocket server ready for connections');
    console.log('\n🔍 Detection Thresholds:');
    console.log('   G-Force: > 2.5g');
    console.log('   Tilt: > 45°');
    console.log('\n📊 API Endpoints:');
    console.log(`   Accidents: http://${getLocalIPAddress()}:${PORT}/api/accidents`);
    console.log(`   Sensor Data: http://${getLocalIPAddress()}:${PORT}/api/sensor-data`);
    console.log(`   Location: http://${getLocalIPAddress()}:${PORT}/api/location`);
    console.log(`   QR Code: http://${getLocalIPAddress()}:${PORT}/api/qr-code`);

    // Display QR code for mobile app connection
    displayQRCode(PORT);

    // Start broadcasting server presence for auto-discovery
    startBroadcasting(PORT);
    console.log('   Auto-discovery: Broadcasting on UDP port 45454');

    console.log('\n---\n');
});
