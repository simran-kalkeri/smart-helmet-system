/**
 * Test MongoDB Connection
 * Run this script to verify MongoDB is configured correctly
 * 
 * Usage: node test-db.js
 */

require('dotenv').config();
const { connectDB, saveAccident, getAccidents, isMongoDBConnected } = require('./services/dbService');

async function testConnection() {
    console.log('\n🧪 Testing MongoDB Connection...\n');

    // Test 1: Connection
    console.log('Test 1: Connecting to MongoDB...');
    const connected = await connectDB();

    if (!connected) {
        console.log('\n❌ MongoDB connection failed or disabled');
        console.log('   Check your .env file:');
        console.log('   - USE_MONGODB should be "true"');
        console.log('   - MONGODB_URI should be set correctly');
        process.exit(1);
    }

    console.log('✅ Connected successfully!\n');

    // Test 2: Save a test accident
    console.log('Test 2: Saving test accident...');
    const testAccident = {
        detected: true,
        detectedAt: new Date(),
        gForce: 8.5,
        tilt: 75,
        confidence: 0.9,
        location: {
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: 10,
            timestamp: Date.now()
        },
        severity: 'HIGH',
        status: 'Test accident',
        userResponse: 'NO_RESPONSE',
        source: 'TEST_SCRIPT'
    };

    const saved = await saveAccident(testAccident);
    if (saved) {
        console.log('✅ Test accident saved!');
        console.log(`   Document ID: ${saved._id}\n`);
    } else {
        console.log('❌ Failed to save test accident\n');
        process.exit(1);
    }

    // Test 3: Retrieve accidents
    console.log('Test 3: Retrieving accidents...');
    const accidents = await getAccidents({ limit: 5 });
    console.log(`✅ Retrieved ${accidents.length} accidents`);

    if (accidents.length > 0) {
        console.log('\n📋 Most recent accident:');
        console.log(`   ID: ${accidents[0]._id}`);
        console.log(`   G-Force: ${accidents[0].gForce}`);
        console.log(`   Tilt: ${accidents[0].tilt}`);
        console.log(`   Severity: ${accidents[0].severity}`);
        console.log(`   Logged: ${accidents[0].loggedAt}`);
    }

    console.log('\n✅ All tests passed! MongoDB is working correctly.\n');
    process.exit(0);
}

// Run tests
testConnection().catch(error => {
    console.error('\n❌ Test failed:', error.message);
    console.error(error);
    process.exit(1);
});
