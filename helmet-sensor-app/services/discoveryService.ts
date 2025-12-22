// Simple HTTP-based discovery service that works with Expo Go
const DISCOVERY_INTERVAL = 2000; // Check every 2 seconds
const DISCOVERY_TIMEOUT = 10000; // 10 seconds total

interface ServerInfo {
    ip: string;
    port: number;
}

class DiscoveryService {
    private discoveryInterval: NodeJS.Timeout | null = null;
    private discoveryCallback: ((serverUrl: string) => void) | null = null;
    private startTime: number = 0;

    /**
     * Start discovering server by scanning common IP addresses
     * @param onServerFound - Callback when server is discovered
     */
    async startDiscovery(onServerFound: (serverUrl: string) => void) {
        this.discoveryCallback = onServerFound;
        this.startTime = Date.now();

        console.log('🔍 Starting HTTP-based server discovery...');

        // Try to discover server
        this.discoverServer();

        // Keep trying until timeout
        this.discoveryInterval = setInterval(() => {
            if (Date.now() - this.startTime > DISCOVERY_TIMEOUT) {
                console.log('⏱️ Discovery timeout - no server found');
                this.stopDiscovery();
                return;
            }
            this.discoverServer();
        }, DISCOVERY_INTERVAL);
    }

    /**
     * Attempt to discover server by checking local network
     */
    private async discoverServer() {
        try {
            // Get device's local IP to determine network range
            // For Expo, we'll try common gateway IPs
            const commonGateways = [
                '192.168.1.1',
                '192.168.0.1',
                '192.168.43.1', // Common hotspot IP
                '10.0.0.1',
                '172.16.0.1',
                '100.106.213.1', // Mobile hotspot range
            ];

            // Try each gateway's network
            for (const gateway of commonGateways) {
                const baseIP = gateway.substring(0, gateway.lastIndexOf('.'));

                // Try common host IPs (1-100 for hotspot range, 1-20 for others)
                const maxIP = gateway.startsWith('100.') ? 100 : 20;
                for (let i = 1; i <= maxIP; i++) {
                    const testIP = `${baseIP}.${i}`;
                    const testUrl = `http://${testIP}:3001`;

                    try {
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 500);

                        const response = await fetch(testUrl, {
                            method: 'GET',
                            signal: controller.signal,
                        });

                        clearTimeout(timeoutId);

                        if (response.ok) {
                            const data = await response.json();
                            if (data.message === 'Helmet Sensor Server') {
                                console.log(`✅ Server discovered at: ${testUrl}`);
                                if (this.discoveryCallback) {
                                    this.discoveryCallback(testUrl);
                                }
                                this.stopDiscovery();
                                return;
                            }
                        }
                    } catch (err) {
                        // Ignore errors, continue scanning
                    }
                }
            }
        } catch (err) {
            console.error('Discovery error:', err);
        }
    }

    /**
     * Stop discovery
     */
    stopDiscovery() {
        if (this.discoveryInterval) {
            clearInterval(this.discoveryInterval);
            this.discoveryInterval = null;
        }
        this.discoveryCallback = null;
        console.log('🛑 Discovery stopped');
    }
}

export default new DiscoveryService();
