import { Accelerometer, Gyroscope } from 'expo-sensors';

export interface SensorData {
    gForce: number;
    tilt: number;
    acceleration: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    location: { latitude: number; longitude: number } | null;
}

// Alert state to prevent spam
type AlertState = 'IDLE' | 'ALERT_ACTIVE' | 'RESOLVED';

class SensorService {
    private accelerometerSubscription: any = null;
    private gyroscopeSubscription: any = null;
    private currentData: SensorData = {
        gForce: 0,
        tilt: 0,
        acceleration: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        location: null,
    };

    private locationSubscription: any = null;
    private alertState: AlertState = 'IDLE';
    private lastAccidentTime: number = 0; // Track last accident time for cooldown

    async startMonitoring(
        onDataUpdate: (data: SensorData) => void,
        onAnomalyDetected: (data: SensorData) => void,
        onContinuousData?: (data: SensorData) => void
    ) {
        const Location = await import('expo-location');

        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
            // Start watching location
            this.locationSubscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 1000,
                    distanceInterval: 1,
                },
                (location: any) => {
                    this.currentData.location = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                    };
                }
            );
        }
        // Set update interval to 50ms for smooth real-time visualization
        Accelerometer.setUpdateInterval(50);
        Gyroscope.setUpdateInterval(50);

        // Subscribe to accelerometer
        this.accelerometerSubscription = Accelerometer.addListener((data) => {
            const { x, y, z } = data;
            this.currentData.acceleration = { x, y, z };

            // Calculate g-force magnitude
            // Expo's accelerometer already returns values in g-units, not m/s²
            const gForce = Math.sqrt(x * x + y * y + z * z);
            this.currentData.gForce = gForce;

            // Calculate tilt angle (in degrees) from accelerometer
            // Using atan2 to get angle from vertical
            const tilt = Math.atan2(y, z) * (180 / Math.PI);
            this.currentData.tilt = tilt;

            // Update callback
            onDataUpdate(this.currentData);

            // Continuous data streaming callback
            if (onContinuousData) {
                onContinuousData(this.currentData);
            }

            // Check for anomaly
            this.checkAnomaly(onAnomalyDetected);
        });

        // Subscribe to gyroscope for rotation data
        this.gyroscopeSubscription = Gyroscope.addListener((data) => {
            this.currentData.rotation = data;
        });

        console.log('🔍 Sensor monitoring started');
    }

    private checkAnomaly(onAnomalyDetected: (data: SensorData) => void) {
        // Only check for anomalies if we're not already handling one
        if (this.alertState !== 'IDLE') {
            return;
        }

        // Cooldown period: 30 seconds between accidents
        const now = Date.now();
        if (now - this.lastAccidentTime < 30000) {
            return; // Still in cooldown period
        }

        const { gForce, tilt } = this.currentData;

        // Dual-factor detection
        const isGForceAnomaly = gForce > 2.5;
        const isTiltAnomaly = Math.abs(tilt) > 45;

        if (isGForceAnomaly || isTiltAnomaly) {
            console.log('🚨 ANOMALY DETECTED!');
            console.log(`  G-Force: ${gForce.toFixed(2)}g ${isGForceAnomaly ? '⚠️' : '✓'}`);
            console.log(`  Tilt: ${tilt.toFixed(2)}° ${isTiltAnomaly ? '⚠️' : '✓'}`);

            // Set state to prevent spam and record accident time
            this.alertState = 'ALERT_ACTIVE';
            this.lastAccidentTime = now;
            console.log('🔒 Alert state locked - no more alerts until resolved');
            console.log('⏱️ 30-second cooldown started');

            onAnomalyDetected(this.currentData);
        }
    }

    stopMonitoring() {
        if (this.accelerometerSubscription) {
            this.accelerometerSubscription.remove();
            this.accelerometerSubscription = null;
        }
        if (this.gyroscopeSubscription) {
            this.gyroscopeSubscription.remove();
            this.gyroscopeSubscription = null;
        }
        if (this.locationSubscription) {
            this.locationSubscription.remove();
            this.locationSubscription = null;
        }
        console.log('🛑 Sensor monitoring stopped');
    }

    getCurrentData(): SensorData {
        return this.currentData;
    }

    resetAlertState() {
        console.log('🔓 Alert state reset - ready for new detections');
        this.alertState = 'IDLE';
    }

    getAlertState(): AlertState {
        return this.alertState;
    }
}

export default new SensorService();
