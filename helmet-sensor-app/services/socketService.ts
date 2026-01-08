import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private serverUrl: string = '';

    connect(serverUrl: string) {
        this.serverUrl = serverUrl;

        // For React Native, we need to allow both polling and websocket
        // The client will start with polling and upgrade to websocket
        this.socket = io(serverUrl, {
            transports: ['polling', 'websocket'], // Changed: Allow polling first for React Native
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            timeout: 10000, // 10 second timeout
            forceNew: true, // Force new connection to avoid issues
        });

        this.socket.on('connect', () => {
            console.log('✅ Connected to server:', serverUrl);
            console.log('   Transport:', this.socket?.io.engine.transport.name);
        });

        this.socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server');
            console.log('   Reason:', reason);
        });

        this.socket.on('connect_error', (error: any) => {
            console.error('❌ Connection error:', error.message);
            if (error.type) console.error('   Type:', error.type);
            if (error.description) console.error('   Description:', error.description);
        });

        this.socket.on('error', (error) => {
            console.error('❌ Socket error:', error);
        });

        return this.socket;
    }

    sendAccidentAlert(data: {
        gForce: number;
        tilt: number;
        timestamp: number;
        location: { latitude: number; longitude: number } | null;
    }) {
        if (this.socket?.connected) {
            console.log('📤 Sending accident alert:', data);
            this.socket.emit('accident_detected', data);
        } else {
            console.error('Socket not connected');
        }
    }

    sendCancelResponse() {
        if (this.socket?.connected) {
            console.log('📤 Sending cancel response');
            this.socket.emit('accident_cancelled');
        }
    }

    sendNoResponse() {
        if (this.socket?.connected) {
            console.log('📤 Sending no response (timeout)');
            this.socket.emit('no_response');
        }
    }

    sendSensorData(data: {
        gForce: number;
        tilt: number;
        acceleration: { x: number; y: number; z: number };
        rotation: { x: number; y: number; z: number };
    }) {
        if (this.socket?.connected) {
            this.socket.emit('sensor_data', data);
        }
    }

    sendLocationUpdate(location: { latitude: number; longitude: number }) {
        if (this.socket?.connected) {
            this.socket.emit('location_update', location);
        }
    }

    sendEmailNotification(data: {
        gForce: number;
        tilt: number;
        location: { latitude: number; longitude: number } | null;
        timestamp: number;
    }) {
        if (this.socket?.connected) {
            console.log('📧 Requesting email notification from server');
            this.socket.emit('send_email_notification', data);
        } else {
            console.error('Socket not connected - cannot send email request');
        }
    }

    onAccidentConfirmed(callback: () => void) {
        this.socket?.on('accident_confirmed', callback);
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export default new SocketService();
