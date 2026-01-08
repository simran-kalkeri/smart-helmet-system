// Quick test script to verify email service
require('dotenv').config();
const { sendAccidentEmail } = require('./services/emailService');

console.log('Testing email service...');
console.log('EMAIL_USER from env:', process.env.EMAIL_USER);
console.log('EMAIL_PASS from env:', process.env.EMAIL_PASS ? '***SET***' : 'NOT SET');

// Test with sample data
sendAccidentEmail({
    gForce: 7.5,
    tilt: 45,
    location: { latitude: 15.3647, longitude: 75.1240 },
    timestamp: Date.now()
}).then(result => {
    console.log('\nResult:', result);
    process.exit(result.success ? 0 : 1);
}).catch(err => {
    console.error('\nError:', err);
    process.exit(1);
});
