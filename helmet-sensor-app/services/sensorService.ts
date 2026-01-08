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

        // Set update interval for sensors (100ms = 10 Hz)
        Accelerometer.setUpdateInterval(100);
        Gyroscope.setUpdateInterval(100);

        // Subscribe to accelerometer
        this.accelerometerSubscription = Accelerometer.addListener((accelerometerData) => {
            const { x, y, z } = accelerometerData;

            // Calculate G-force (total acceleration magnitude)
            const gForce = Math.sqrt(x * x + y * y + z * z);

            // Store raw acceleration data
            this.currentData.acceleration = { x, y, z };
            this.currentData.gForce = gForce;

            // Check for anomalies (crashes)
            this.checkAnomaly(onAnomalyDetected);

            // Call continuous data callback if provided (for live streaming)
            if (onContinuousData) {
                onContinuousData(this.currentData);
            }

            // Call main data update callback
            onDataUpdate(this.currentData);
        });

        // Subscribe to gyroscope
        this.gyroscopeSubscription = Gyroscope.addListener((gyroscopeData) => {
            const { x, y, z } = gyroscopeData;

            // Calculate tilt from gyroscope (for simplicity, using magnitude)
            const tilt = Math.sqrt(x * x + y * y + z * z) * (180 / Math.PI);

            this.currentData.rotation = { x, y, z };
            this.currentData.tilt = tilt;
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

        const { acceleration, tilt } = this.currentData;
        const { x, y, z } = acceleration;

        // ESP32-style detection logic with confidence scoring
        // Calculate total acceleration magnitude (similar to ESP32)
        const A = Math.sqrt(x * x + y * y + z * z);

        // Calculate pitch and roll angles (like ESP32)
        const pitch = Math.abs(Math.atan2(x, Math.sqrt(y * y + z * z)) * (180 / Math.PI));
        const roll = Math.abs(Math.atan2(y, Math.sqrt(x * x + z * z)) * (180 / Math.PI));

        // ESP32 Thresholds (from config.h)
        const ACCEL_CRASH_G = 2.0;
        const HARD_IMPACT_G = 3.5;
        const TILT_THRESHOLD_DEG = 60;

        // Confidence-based detection (matching ESP32 crash_detector.cpp)
        let confidence = 0;

        if (A > ACCEL_CRASH_G) confidence += 0.4;
        if (pitch > TILT_THRESHOLD_DEG || roll > TILT_THRESHOLD_DEG) confidence += 0.4;
        if (A > HARD_IMPACT_G) confidence = 1.0; // Hard impact overrides

        // Trigger crash if confidence >= 0.7 (matching ESP32)
        if (confidence >= 0.7) {
            console.log('🚨 CRASH DETECTED! (ESP32-style confidence-based)');
            console.log(`  Acceleration Magnitude: ${A.toFixed(2)}g ${A > ACCEL_CRASH_G ? '⚠️' : '✓'}`);
            console.log(`  Pitch: ${pitch.toFixed(2)}° ${pitch > TILT_THRESHOLD_DEG ? '⚠️' : '✓'}`);
            console.log(`  Roll: ${roll.toFixed(2)}° ${roll > TILT_THRESHOLD_DEG ? '⚠️' : '✓'}`);
            console.log(`  Confidence: ${confidence.toFixed(2)} (threshold: 0.7)`);

            // Set state to prevent spam and record accident time
            this.alertState = 'ALERT_ACTIVE';
            this.lastAccidentTime = now;
            console.log('🔒 Alert state locked - no more alerts until resolved');
            console.log('⏱️ 30-second cooldown started');

            // Update gForce to use magnitude
            this.currentData.gForce = A;

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
        this.alertState = 'IDLE';
        console.log('🛑 Sensor monitoring stopped');
    }

    getCurrentData(): SensorData {
        return this.currentData;
    }

    resetAlertState() {
        console.log('🔓 Alert state reset - ready for next detection');
        this.alertState = 'IDLE';
    }
}

export default new SensorService();
