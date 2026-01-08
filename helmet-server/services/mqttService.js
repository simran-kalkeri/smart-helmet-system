const mqtt = require('mqtt');
const alertService = require('./alertService');
const emailService = require('./emailService');

const MQTT_BROKER = "mqtt://broker.hivemq.com:1883";
let mqttClient = null;
let io = null;

// Cache for pending accident data (location + telemetry from mobile)
const pendingCache = new Map();

function setSocketIO(socketIO) {
    io = socketIO;
}

function initializeMQTT() {
    mqttClient = mqtt.connect(MQTT_BROKER, {
        clientId: `helmet_server_${Date.now()}`,
        clean: true,
        reconnectPeriod: 1000
    });

    mqttClient.on('connect', () => {
        console.log('✅ Server MQTT connected');

        mqttClient.subscribe('helmet/+/event', { qos: 1 }, (err) => {
            if (!err) {
                console.log('📡 Subscribed to helmet/+/event');
            }
        });
    });

    mqttClient.on('message', (topic, message) => {
        try {
            const event = JSON.parse(message.toString());
            console.log(`\n📨 ${event.type} from ${event.source || 'UNKNOWN'}`);

            handleHelmetEvent(event);
        } catch (error) {
            console.error('❌ Parse error:', error);
        }
    });

    mqttClient.on('error', (err) => {
        console.error('❌ MQTT error:', err);
    });

    mqttClient.on('close', () => {
        console.log('⚠️ MQTT connection closed');
    });
}

function handleHelmetEvent(event) {
    // ALWAYS broadcast to dashboard via WebSocket
    if (io) {
        io.emit("helmet_event", event);
        console.log("   → Broadcast to dashboard");
    }

    const helmetId = event.helmetId || 'H001';

    switch (event.type) {
        case 'ACCIDENT_PENDING':
            console.log("   ⏳ Accident pending");

            // Cache data from this event (especially location from mobile)
            const existing = pendingCache.get(helmetId) || {};

            // Merge - prioritize mobile's location
            if (event.location) {
                existing.location = event.location;
                console.log("   📍 Cached location:", event.location);
            }
            if (event.gForce) {
                existing.gForce = event.gForce;
            }
            if (event.tilt) {
                existing.tilt = event.tilt;
            }
            if (event.acceleration) {
                existing.acceleration = event.acceleration;
            }

            pendingCache.set(helmetId, existing);
            break;

        case 'CRASH_CANCELLED':
            console.log("   ✅ Cancelled");

            const cancelCache = pendingCache.get(helmetId) || {};

            alertService.logAccident({
                gForce: cancelCache.gForce || event.gForce || 0,
                tilt: cancelCache.tilt || event.tilt || 0,
                location: cancelCache.location || event.location || null,
                timestamp: Date.now(),
                helmetId,
                source: event.source || 'ESP32',
                severity: 'low',
                status: 'Cancelled',
                isCancelled: true
            });

            pendingCache.delete(helmetId);
            break;

        case 'CRASH_CONFIRMED':
            console.log("   🚨 CONFIRMED");

            // Get cached data from ACCIDENT_PENDING
            const cache = pendingCache.get(helmetId) || {};

            // Merge: use event data first, fallback to cache
            const finalGForce = event.gForce || cache.gForce || 0;
            const finalTilt = event.tilt || cache.tilt || 0;
            const finalLocation = cache.location || event.location || null;
            const finalAcceleration = event.acceleration || cache.acceleration || {};

            console.log("   📊 Final merged data:");
            console.log("      gForce:", finalGForce);
            console.log("      tilt:", finalTilt);
            console.log("      location:", finalLocation);

            // Log accident
            alertService.logAccident({
                gForce: finalGForce,
                tilt: finalTilt,
                acceleration: finalAcceleration,
                location: finalLocation,
                timestamp: Date.now(),
                helmetId,
                source: event.source || 'ESP32',
                severity: 'high',
                status: 'Confirmed',
                isCancelled: false
            });

            // Send email with merged data
            if (finalLocation) {
                console.log("   📧 Sending email...");
                emailService.sendAccidentEmail({
                    gForce: finalGForce,
                    tilt: finalTilt,
                    location: finalLocation,
                    timestamp: Date.now(),
                    source: event.source || 'ESP32'
                }).then(result => {
                    if (result && result.success) {
                        console.log("   ✅ Email sent successfully");
                    } else {
                        console.log("   ⚠️ Email result:", result);
                    }
                }).catch(err => {
                    console.error("   ❌ Email error:", err);
                });
            } else {
                console.log("   ⚠️ No location - email not sent");
            }

            pendingCache.delete(helmetId);
            break;
    }
}

module.exports = {
    initializeMQTT,
    setSocketIO
};
