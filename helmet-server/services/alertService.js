/**
 * Alert Management Service
 * Handles accident severity classification and logging
 */

const fs = require('fs');
const path = require('path');

const LOGS_DIR = path.join(__dirname, '../logs');
const ACCIDENTS_LOG = path.join(LOGS_DIR, 'accidents.json');

// Ensure logs directory exists
if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Initialize accidents log file if it doesn't exist
if (!fs.existsSync(ACCIDENTS_LOG)) {
    fs.writeFileSync(ACCIDENTS_LOG, JSON.stringify([], null, 2));
}

function classifyAccident(accidentData, userResponse) {
    let severity;
    let status;

    if (userResponse === 'CANCELLED') {
        severity = 'FALSE_ALARM';
        status = 'User confirmed they are okay';
        console.log('\n✅ ACCIDENT CANCELLED');
        console.log('  User is conscious and responded');
        console.log('  Severity: FALSE_ALARM');
    } else if (userResponse === 'NO_RESPONSE') {
        severity = 'HIGH';
        status = 'No response from user - Emergency!';
        console.log('\n🚨 HIGH SEVERITY ACCIDENT');
        console.log('  User did not respond within timeout');
        console.log('  Severity: HIGH');
        console.log('  ⚠️ EMERGENCY SERVICES SHOULD BE NOTIFIED');
    }

    const classifiedAccident = {
        ...accidentData,
        severity,
        status,
        responseTime: Date.now(),
        userResponse,
    };

    // Log to file
    logAccident(classifiedAccident);

    return classifiedAccident;
}

function logAccident(accidentData) {
    try {
        // Read existing logs
        const logs = JSON.parse(fs.readFileSync(ACCIDENTS_LOG, 'utf8'));

        // Add new accident
        logs.push({
            ...accidentData,
            loggedAt: new Date().toISOString(),
        });

        // Write back to file
        fs.writeFileSync(ACCIDENTS_LOG, JSON.stringify(logs, null, 2));

        console.log(`\n📝 Accident logged to: ${ACCIDENTS_LOG}`);
    } catch (error) {
        console.error('Error logging accident:', error);
    }
}

function getAccidentLogs() {
    try {
        return JSON.parse(fs.readFileSync(ACCIDENTS_LOG, 'utf8'));
    } catch (error) {
        console.error('Error reading accident logs:', error);
        return [];
    }
}

module.exports = {
    classifyAccident,
    logAccident,
    getAccidentLogs,
};
