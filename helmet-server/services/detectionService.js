/**
 * Accident Detection Service
 * Validates sensor data and determines if an accident occurred
 */

function detectAccident(sensorData) {
    const { gForce, tilt, timestamp, location } = sensorData;

    // Dual-factor detection logic
    const isGForceAnomaly = gForce > 2.5;
    const isTiltAnomaly = Math.abs(tilt) > 45;

    if (isGForceAnomaly || isTiltAnomaly) {
        const reason = isGForceAnomaly ? 'G_FORCE' : 'TILT';

        console.log('\n🚨 ACCIDENT DETECTED!');
        console.log(`  Reason: ${reason}`);
        console.log(`  G-Force: ${gForce.toFixed(2)}g ${isGForceAnomaly ? '⚠️ EXCEEDED' : '✓'}`);
        console.log(`  Tilt: ${tilt.toFixed(2)}° ${isTiltAnomaly ? '⚠️ EXCEEDED' : '✓'}`);
        console.log(`  Timestamp: ${new Date(timestamp).toLocaleString()}`);
        console.log(`  Location: ${location ? JSON.stringify(location) : 'N/A'}`);

        return {
            detected: true,
            reason,
            severity: 'PENDING', // Will be updated based on user response
            timestamp,
            location,
            sensorData: { gForce, tilt },
        };
    }

    return { detected: false };
}

module.exports = { detectAccident };
