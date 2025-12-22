import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import sensorService, { SensorData } from '../services/sensorService';
import socketService from '../services/socketService';
import LiveMapWebView from '../components/LiveMapWebView';
import CancelButton from '../components/CancelButton';
import QRScanner from '../components/QRScanner';
import discoveryService from '../services/discoveryService';

const SensorScreen: React.FC = () => {
    const [serverUrl, setServerUrl] = useState('http://192.168.1.x:3001');
    const [isConnected, setIsConnected] = useState(false);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [sensorData, setSensorData] = useState<SensorData | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [lastAnomalyTime, setLastAnomalyTime] = useState(0);
    const [showQRScanner, setShowQRScanner] = useState(false);
    const [alertSent, setAlertSent] = useState(false); // Track if alert was sent for current incident

    const STORAGE_KEY = '@helmet_server_url';

    useEffect(() => {
        // Load saved server URL from AsyncStorage
        const loadSavedServer = async () => {
            try {
                const savedUrl = await AsyncStorage.getItem(STORAGE_KEY);
                if (savedUrl) {
                    console.log('📦 Loaded saved server URL:', savedUrl);
                    setServerUrl(savedUrl);
                    // Auto-connect to saved server
                    connectToServer(savedUrl);
                } else {
                    // Start automatic server discovery if no saved URL
                    console.log('🔍 Starting automatic server discovery...');
                    discoveryService.startDiscovery((discoveredUrl) => {
                        console.log(`✅ Auto-discovered server: ${discoveredUrl}`);
                        setServerUrl(discoveredUrl);
                        connectToServer(discoveredUrl);
                    });
                }
            } catch (error) {
                console.error('Error loading saved server:', error);
            }
        };

        loadSavedServer();

        return () => {
            sensorService.stopMonitoring();
            socketService.disconnect();
            discoveryService.stopDiscovery();
        };
    }, []);

    const connectToServer = async (url: string) => {
        const socket = socketService.connect(url);

        socket.on('connect', async () => {
            setIsConnected(true);
            // Save URL to AsyncStorage on successful connection
            try {
                await AsyncStorage.setItem(STORAGE_KEY, url);
                console.log('💾 Saved server URL to storage');
            } catch (error) {
                console.error('Error saving server URL:', error);
            }
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Listen for accident confirmation from server
        socketService.onAccidentConfirmed(() => {
            console.log('✅ Server confirmed accident - showing alert');
            setShowAlert(true);
        });
    };

    const handleConnect = () => {
        connectToServer(serverUrl);
    };

    const handleQRScan = (url: string) => {
        setServerUrl(url);
        setShowQRScanner(false);
        connectToServer(url);
    };

    const handleStartMonitoring = () => {
        setIsMonitoring(true);

        sensorService.startMonitoring(
            // On data update
            (data) => {
                setSensorData(data);
            },
            // On anomaly detected
            (data) => {
                // Only send alert if we haven't already sent one for this incident
                if (!alertSent) {
                    const now = Date.now();
                    console.log('🚨 First anomaly detected - sending alert');
                    setAlertSent(true); // Mark that we've sent the alert

                    // Send accident alert to server (ONLY ONCE)
                    socketService.sendAccidentAlert({
                        gForce: data.gForce,
                        tilt: data.tilt,
                        timestamp: now,
                        location: data.location,
                    });
                } else {
                    console.log('⏭️ Anomaly detected but alert already sent - skipping');
                }
            },
            // On continuous data (stream to server)
            (data) => {
                // Send sensor data to server every update
                socketService.sendSensorData({
                    gForce: data.gForce,
                    tilt: data.tilt,
                    acceleration: data.acceleration,
                    rotation: data.rotation,
                });

                // Send location updates if available
                if (data.location) {
                    socketService.sendLocationUpdate(data.location);
                }
            }
        );
    };

    const handleStopMonitoring = () => {
        setIsMonitoring(false);
        sensorService.stopMonitoring();
    };

    const handleCancelAlert = () => {
        console.log('✅ User cancelled alert');
        socketService.sendCancelResponse();
        setShowAlert(false);

        // Reset alert state for next incident
        setAlertSent(false);
        sensorService.resetAlertState();
    };

    const handleAlertTimeout = () => {
        console.log('⏱️ Alert timeout - no response');

        // Send no response to server
        socketService.sendNoResponse();

        // Trigger email notification via server
        const currentData = sensorService.getCurrentData();
        socketService.sendEmailNotification({
            gForce: currentData.gForce,
            tilt: currentData.tilt,
            location: currentData.location,
            timestamp: Date.now(),
        });

        setShowAlert(false);

        // Reset alert state for next incident
        setAlertSent(false);
        sensorService.resetAlertState();

        // Show email confirmation
        setTimeout(() => {
            Alert.alert(
                '📧 Email Sent',
                'Emergency notification has been sent to your contact!',
                [{ text: 'OK' }]
            );
        }, 500);
    };

    const getStatusColor = () => {
        if (!isConnected) return '#d32f2f';
        if (!isMonitoring) return '#f57c00';
        return '#4caf50';
    };

    const getStatusText = () => {
        if (!isConnected) return 'Disconnected';
        if (!isMonitoring) return 'Connected - Not Monitoring';
        return 'Monitoring Active';
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>🪖 Helmet Sensor</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                        <Text style={styles.statusText}>{getStatusText()}</Text>
                    </View>
                </View>

                {/* Map with Live Location */}
                <LiveMapWebView location={sensorData?.location || null} />

                {/* Connection Section */}
                {!isConnected && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Server Connection</Text>
                        <Text style={styles.connectionHint}>🔍 Auto-discovering... or enter manually:</Text>
                        <TextInput
                            style={styles.input}
                            value={serverUrl}
                            onChangeText={setServerUrl}
                            placeholder="Enter server URL (e.g., http://100.106.213.78:3001)"
                            placeholderTextColor="#999"
                        />
                        <TouchableOpacity style={styles.primaryButton} onPress={handleConnect}>
                            <Text style={styles.primaryButtonText}>Connect to Server</Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => setShowQRScanner(true)}
                        >
                            <Text style={styles.secondaryButtonText}>📷 Scan QR Code</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Monitoring Controls */}
                {isConnected && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sensor Monitoring</Text>
                        {!isMonitoring ? (
                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={handleStartMonitoring}
                            >
                                <Text style={styles.primaryButtonText}>Start Monitoring</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.dangerButton}
                                onPress={handleStopMonitoring}
                            >
                                <Text style={styles.dangerButtonText}>Stop Monitoring</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* Sensor Data Display */}
                {isMonitoring && sensorData && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Live Sensor Data</Text>

                        <View style={styles.dataGrid}>
                            <View style={styles.dataCard}>
                                <Text style={styles.dataLabel}>G-Force</Text>
                                <Text style={[
                                    styles.dataValue,
                                    sensorData.gForce > 2.5 && styles.dataValueAlert
                                ]}>
                                    {sensorData.gForce.toFixed(2)}g
                                </Text>
                            </View>

                            <View style={styles.dataCard}>
                                <Text style={styles.dataLabel}>Tilt</Text>
                                <Text style={[
                                    styles.dataValue,
                                    Math.abs(sensorData.tilt) > 45 && styles.dataValueAlert
                                ]}>
                                    {sensorData.tilt.toFixed(1)}°
                                </Text>
                            </View>
                        </View>

                        {/* Visual Tilt Meter */}
                        <View style={styles.tiltMeterContainer}>
                            <Text style={styles.tiltMeterLabel}>Tilt Visualization</Text>
                            <View style={styles.tiltMeter}>
                                {/* Background scale */}
                                <View style={styles.tiltScale}>
                                    <Text style={styles.scaleText}>-90°</Text>
                                    <Text style={styles.scaleText}>0°</Text>
                                    <Text style={styles.scaleText}>+90°</Text>
                                </View>

                                {/* Tilt indicator bar */}
                                <View style={styles.tiltBarContainer}>
                                    <View
                                        style={[
                                            styles.tiltBar,
                                            {
                                                transform: [{ rotate: `${sensorData.tilt}deg` }],
                                                backgroundColor: Math.abs(sensorData.tilt) > 45 ? '#ef4444' : '#3b82f6'
                                            }
                                        ]}
                                    />
                                    <View style={styles.tiltCenter} />
                                </View>

                                {/* Threshold markers */}
                                <View style={styles.thresholdMarkers}>
                                    <View style={[styles.thresholdLine, { left: '25%' }]} />
                                    <View style={[styles.thresholdLine, { left: '75%' }]} />
                                </View>
                            </View>
                            <Text style={styles.tiltMeterHint}>
                                {Math.abs(sensorData.tilt) > 45 ? '⚠️ Threshold exceeded!' : '✓ Normal range'}
                            </Text>
                        </View>

                        <View style={styles.detailsCard}>
                            <Text style={styles.detailsTitle}>Acceleration (m/s²)</Text>
                            <Text style={styles.detailsText}>
                                X: {sensorData.acceleration.x.toFixed(2)} |
                                Y: {sensorData.acceleration.y.toFixed(2)} |
                                Z: {sensorData.acceleration.z.toFixed(2)}
                            </Text>
                        </View>

                        <View style={styles.detailsCard}>
                            <Text style={styles.detailsTitle}>Rotation (rad/s)</Text>
                            <Text style={styles.detailsText}>
                                X: {sensorData.rotation.x.toFixed(2)} |
                                Y: {sensorData.rotation.y.toFixed(2)} |
                                Z: {sensorData.rotation.z.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <Text style={styles.infoTitle}>Detection Thresholds</Text>
                    <Text style={styles.infoText}>• G-Force: &gt; 2.5g</Text>
                    <Text style={styles.infoText}>• Tilt: &gt; 45°</Text>
                </View>
            </ScrollView>

            {/* QR Scanner Overlay */}
            {showQRScanner && (
                <View style={styles.qrScannerOverlay}>
                    <QRScanner
                        onScanSuccess={handleQRScan}
                        onCancel={() => setShowQRScanner(false)}
                    />
                </View>
            )}

            {/* Alert Overlay */}
            {showAlert && (
                <CancelButton
                    onCancel={handleCancelAlert}
                    onTimeout={handleAlertTimeout}
                    duration={10}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        alignSelf: 'flex-start',
    },
    statusText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        marginBottom: 16,
        color: '#333',
    },
    primaryButton: {
        backgroundColor: '#2196f3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dangerButton: {
        backgroundColor: '#d32f2f',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    dangerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dataGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    dataCard: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
    },
    dataLabel: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
        textTransform: 'uppercase',
        fontWeight: '600',
    },
    dataValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dataValueAlert: {
        color: '#d32f2f',
    },
    detailsCard: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    detailsTitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 6,
        fontWeight: '600',
    },
    detailsText: {
        fontSize: 14,
        color: '#333',
        fontFamily: 'monospace',
    },
    infoSection: {
        backgroundColor: '#e3f2fd',
        borderRadius: 12,
        padding: 16,
        marginTop: 8,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1976d2',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#1976d2',
        marginBottom: 4,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 14,
        color: '#999',
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#2196f3',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: '#2196f3',
        fontSize: 16,
        fontWeight: '600',
    },
    qrScannerOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    connectionHint: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    connectingIndicator: {
        alignItems: 'center',
        padding: 24,
    },
    connectingIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    connectingText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '600',
    },
    connectingSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    tiltMeterContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
    },
    tiltMeterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
        textAlign: 'center',
    },
    tiltMeter: {
        height: 120,
        position: 'relative',
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tiltScale: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    scaleText: {
        fontSize: 11,
        color: '#999',
        fontWeight: '600',
    },
    tiltBarContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tiltBar: {
        width: 120,
        height: 6,
        borderRadius: 3,
        position: 'absolute',
    },
    tiltCenter: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#333',
        borderWidth: 3,
        borderColor: '#fff',
        zIndex: 10,
    },
    thresholdMarkers: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    thresholdLine: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: '#fbbf24',
        opacity: 0.5,
    },
    tiltMeterHint: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        fontWeight: '600',
    },
});

export default SensorScreen;
