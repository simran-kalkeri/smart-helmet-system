import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface LiveMapWebViewProps {
    location: { latitude: number; longitude: number } | null;
}

const LiveMapWebView: React.FC<LiveMapWebViewProps> = ({ location }) => {
    const webViewRef = useRef<WebView>(null);

    useEffect(() => {
        if (location && webViewRef.current) {
            // Update marker position when location changes
            const updateScript = `
                if (window.marker && window.map) {
                    window.marker.setLatLng([${location.latitude}, ${location.longitude}]);
                    window.map.setView([${location.latitude}, ${location.longitude}], 15);
                    document.getElementById('coords').innerHTML = '📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}';
                }
                true;
            `;
            webViewRef.current.injectJavaScript(updateScript);
        }
    }, [location]);

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
            <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                }
                #map {
                    height: 100%;
                    width: 100%;
                }
                .location-info {
                    position: absolute;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: white;
                    padding: 8px 16px;
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    z-index: 1000;
                    font-family: Arial, sans-serif;
                    font-size: 12px;
                    color: #333;
                }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <div class="location-info" id="coords">
                ${location ? `📍 ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}` : '📍 Waiting for GPS...'}
            </div>
            <script>
                // Initialize map
                const initialLat = ${location?.latitude || 15.3647};
                const initialLng = ${location?.longitude || 75.1240};
                
                window.map = L.map('map').setView([initialLat, initialLng], 15);
                
                // Add OpenStreetMap tiles
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(window.map);
                
                // Custom marker icon
                const customIcon = L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });
                
                // Add marker
                window.marker = L.marker([initialLat, initialLng], { icon: customIcon })
                    .addTo(window.map)
                    .bindPopup('📍 Your Location');
                
                // Add accuracy circle
                window.accuracyCircle = L.circle([initialLat, initialLng], {
                    color: '#3b82f6',
                    fillColor: '#3b82f6',
                    fillOpacity: 0.1,
                    radius: 50
                }).addTo(window.map);
            </script>
        </body>
        </html>
    `;

    return (
        <View style={styles.container}>
            <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                style={styles.webview}
                scrollEnabled={false}
                javaScriptEnabled={true}
                domStorageEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    webview: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    placeholderContainer: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    placeholder: {
        flex: 1,
        backgroundColor: '#e8f4f8',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderIcon: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    pulsingDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#3b82f6',
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c5f7a',
    },
});

export default LiveMapWebView;
