import mqtt from 'mqtt';

const BROKER_URL = 'ws://broker.hivemq.com:8000/mqtt';
let client: mqtt.MqttClient | null = null;
let eventCallback: ((event: any) => void) | null = null;

export function connectMQTT() {
    const clientId = `mobile_${Date.now()}`;

    client = mqtt.connect(BROKER_URL, {
        clientId,
        clean: true,
        reconnectPeriod: 1000,
    });

    client.on('connect', () => {
        console.log('✅ MQTT connected');
        client?.subscribe('helmet/+/event', { qos: 1 });
    });

    client.on('message', (topic, payload) => {
        try {
            const event = JSON.parse(payload.toString());
            if (eventCallback) {
                eventCallback(event);
            }
        } catch (err) {
            console.error('Parse error:', err);
        }
    });
}

export function disconnectMQTT() {
    if (client) {
        client.end();
        client = null;
    }
}

export function onEvent(callback: (event: any) => void) {
    eventCallback = callback;
}

export function publishAccidentPending(telemetry: any, location: { latitude: number; longitude: number } | null) {
    if (client && client.connected) {
        const event = {
            type: 'ACCIDENT_PENDING',
            helmetId: 'H001',
            source: 'MOBILE',
            timestamp: Date.now(),
            gForce: telemetry.gForce,
            tilt: Math.abs(Math.atan2(telemetry.acceleration.x, Math.sqrt(telemetry.acceleration.y ** 2 + telemetry.acceleration.z ** 2)) * (180 / Math.PI)),
            acceleration: telemetry.acceleration,
            location
        };

        client.publish('helmet/H001/event', JSON.stringify(event), { qos: 1 });
        console.log("✅ ACCIDENT_PENDING published with location:", location);
    }
}
