import { io, Socket } from 'socket.io-client';

interface SensorData {
    gForce: number;
    tilt: number;
    acceleration: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
}

interface LocationData {
    latitude: number;
    longitude: number;
}

interface AccidentData {
    gForce: number;
    tilt: number;
    timestamp: number;
    location: LocationData | null;
}

class HelmetSocketService {
    private socket: Socket | null = null;
    private serverUrl: string = '';

    // Callbacks
    private onSensorDataCallback: ((data: SensorData) => void) | null = null;
    private onLocationUpdateCallback: ((location: LocationData) => void) | null = null;
    private onAccidentCallback: ((data: AccidentData) => void) | null = null;
    private onConnectionCallback: ((connected: boolean) => void) | null = null;

    /**
     * Connect to helmet server
     */
    connect(serverUrl: string) {
        this.serverUrl = serverUrl;

        this.socket = io(serverUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to helmet server');
            if (this.onConnectionCallback) {
                this.onConnectionCallback(true);
            }
        });

        this.socket.on('disconnect', () => {
            console.log('❌ Disconnected from helmet server');
            if (this.onConnectionCallback) {
                this.onConnectionCallback(false);
            }
        });

        // Listen for sensor data from mobile app
        this.socket.on('sensor_data', (data: SensorData) => {
            if (this.onSensorDataCallback) {
                this.onSensorDataCallback(data);
            }
        });

        // Listen for location updates from mobile app
        this.socket.on('location_update', (location: LocationData) => {
            if (this.onLocationUpdateCallback) {
                this.onLocationUpdateCallback(location);
            }
        });

        // Listen for accident alerts
        this.socket.on('accident_confirmed', () => {
            console.log('🚨 Accident confirmed from server');
        });

        return this.socket;
    }

    /**
     * Disconnect from helmet server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    /**
     * Register callback for sensor data
     */
    onSensorData(callback: (data: SensorData) => void) {
        this.onSensorDataCallback = callback;
    }

    /**
     * Register callback for location updates
     */
    onLocationUpdate(callback: (location: LocationData) => void) {
        this.onLocationUpdateCallback = callback;
    }

    /**
     * Register callback for accidents
     */
    onAccident(callback: (data: AccidentData) => void) {
        this.onAccidentCallback = callback;
    }

    /**
     * Register callback for connection status
     */
    onConnection(callback: (connected: boolean) => void) {
        this.onConnectionCallback = callback;
    }

    /**
     * Get connection status
     */
    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    /**
     * Get socket instance for custom event listeners
     */
    getSocket(): Socket | null {
        return this.socket;
    }
}

export default new HelmetSocketService();
