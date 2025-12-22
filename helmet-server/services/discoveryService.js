const dgram = require('dgram');
const { getLocalIPAddress } = require('./qrService');

const BROADCAST_PORT = 45454;
const BROADCAST_INTERVAL = 3000; // Broadcast every 3 seconds

let broadcastInterval = null;

/**
 * Start broadcasting server presence on the network
 * @param {number} serverPort - The HTTP/WebSocket server port
 */
function startBroadcasting(serverPort) {
    const socket = dgram.createSocket('udp4');

    socket.bind(() => {
        socket.setBroadcast(true);

        const message = JSON.stringify({
            type: 'HELMET_SERVER',
            ip: getLocalIPAddress(),
            port: serverPort,
            timestamp: Date.now(),
        });

        broadcastInterval = setInterval(() => {
            socket.send(
                message,
                0,
                message.length,
                BROADCAST_PORT,
                '255.255.255.255',
                (err) => {
                    if (err) {
                        console.error('Broadcast error:', err);
                    }
                }
            );
        }, BROADCAST_INTERVAL);

        console.log(`📡 Broadcasting server presence on port ${BROADCAST_PORT}`);
    });

    return socket;
}

/**
 * Stop broadcasting server presence
 */
function stopBroadcasting() {
    if (broadcastInterval) {
        clearInterval(broadcastInterval);
        broadcastInterval = null;
    }
}

module.exports = {
    startBroadcasting,
    stopBroadcasting,
    BROADCAST_PORT,
};
