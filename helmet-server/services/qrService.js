const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const os = require('os');

/**
 * Get the local IP address of the server
 */
function getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            // Skip internal (loopback) and non-IPv4 addresses
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}

/**
 * Generate and display QR code in terminal
 * @param {number} port - Server port
 */
function displayQRCode(port) {
    const ipAddress = getLocalIPAddress();
    const serverUrl = `http://${ipAddress}:${port}`;

    console.log('\n📱 Mobile App Connection:');
    console.log(`   Server URL: ${serverUrl}`);
    console.log('\n   Scan this QR code with your mobile app:\n');

    // Display QR code in terminal
    qrcodeTerminal.generate(serverUrl, { small: true }, (qrcode) => {
        console.log(qrcode);
    });

    console.log(`\n   Or manually enter: ${serverUrl}\n`);
}

/**
 * Generate QR code as data URL for web display
 * @param {number} port - Server port
 * @returns {Promise<string>} QR code data URL
 */
async function generateQRCodeDataURL(port) {
    const ipAddress = getLocalIPAddress();
    const serverUrl = `http://${ipAddress}:${port}`;

    try {
        const dataUrl = await qrcode.toDataURL(serverUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            width: 300,
        });
        return dataUrl;
    } catch (err) {
        console.error('Error generating QR code:', err);
        return null;
    }
}

module.exports = {
    displayQRCode,
    generateQRCodeDataURL,
    getLocalIPAddress,
};
