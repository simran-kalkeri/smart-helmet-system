/**
 * Accident Detection Service
 * Validates sensor data and determines if an accident occurred
 */

function detectAccident(sensorData) {
    const { gForce, tilt, timestamp, location } = sensorData;

    // ESP32-style confidence-based detection logic
    // Thresholds from ESP32 config.h
    const ACCEL_CRASH_G = 6.5;
    const HARD_IMPACT_G = 9.0;
    const TILT_THRESHOLD_DEG = 60;

    // Confidence scoring (matching ESP32 crash_detector.cpp)
    let confidence = 0;

    if (gForce > ACCEL_CRASH_G) confidence += 0.4;
    if (Math.abs(tilt) > TILT_THRESHOLD_DEG) confidence += 0.4;
    if (gForce > HARD_IMPACT_G) confidence = 1.0; // Hard impact overrides

    // Require confidence >= 0.7 to detect accident
    if (confidence >= 0.7) {
        const reason = gForce > HARD_IMPACT_G ? 'HARD_IMPACT' : gForce > ACCEL_CRASH_G ? 'G_FORCE' : 'TILT';

        console.log('\n🚨 ACCIDENT DETECTED! (ESP32-style confidence-based)');
        console.log(`  Reason: ${reason}`);
        console.log(`  G-Force: ${gForce.toFixed(2)}g ${gForce > ACCEL_CRASH_G ? '⚠️ EXCEEDED' : '✓'}`);
        console.log(`  Tilt: ${Math.abs(tilt).toFixed(2)}° ${Math.abs(tilt) > TILT_THRESHOLD_DEG ? '⚠️ EXCEEDED' : '✓'}`);
        console.log(`  Confidence: ${confidence.toFixed(2)} (threshold: 0.7)`);
        console.log(`  Timestamp: ${new Date(timestamp).toLocaleString()}`);
        console.log(`  Location: ${location ? JSON.stringify(location) : 'N/A'}`);

        return {
            detected: true,
            reason,
            confidence,
            severity: 'PENDING', // Will be updated based on user response
            timestamp,
            location,
            sensorData: { gForce, tilt },
        };
    }

    return { detected: false };
}

module.exports = { detectAccident };
