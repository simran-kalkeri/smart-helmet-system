/**
 * Alert Management Service
 * Handles accident severity classification and logging
 * 
 * ROLLBACK: Set USE_MONGODB=false in .env to use file-only logging
 */

const fs = require('fs');
const path = require('path');
const { saveAccident, getAccidents, isMongoDBConnected } = require('./dbService');

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

async function logAccident(accidentData) {
    try {
        const accidentRecord = {
            ...accidentData,
            loggedAt: new Date().toISOString(),
        };

        // Try MongoDB first if enabled
        if (isMongoDBConnected()) {
            try {
                await saveAccident(accidentRecord);
                console.log('   💾 Saved to MongoDB');
            } catch (mongoError) {
                console.error('   ⚠️ MongoDB save failed, using file backup:', mongoError.message);
            }
        }

        // Always save to file as backup/fallback
        const logs = JSON.parse(fs.readFileSync(ACCIDENTS_LOG, 'utf8'));
        logs.push(accidentRecord);
        fs.writeFileSync(ACCIDENTS_LOG, JSON.stringify(logs, null, 2));
        console.log(`   📝 Accident logged to file: ${ACCIDENTS_LOG}`);
    } catch (error) {
        console.error('Error logging accident:', error);
    }
}

async function getAccidentLogs() {
    try {
        // Use MongoDB if connected
        if (isMongoDBConnected()) {
            try {
                const accidents = await getAccidents({ limit: 1000 });
                console.log(`📊 Retrieved ${accidents.length} accidents from MongoDB`);
                return accidents;
            } catch (mongoError) {
                console.error('⚠️ MongoDB query failed, falling back to file:', mongoError.message);
                // Fall through to file-based logging
            }
        }

        // Fallback to file-based logging
        const logs = JSON.parse(fs.readFileSync(ACCIDENTS_LOG, 'utf8'));
        console.log(`📊 Retrieved ${logs.length} accidents from file`);
        return logs;
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
