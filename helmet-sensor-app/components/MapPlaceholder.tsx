import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

interface LiveMapProps {
    location: { latitude: number; longitude: number } | null;
}

const LiveMap: React.FC<LiveMapProps> = ({ location }) => {
    if (!location) {
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderIcon}>📍</Text>
                <Text style={styles.placeholderText}>Waiting for GPS...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.mapPlaceholder}>
                <Text style={styles.mapIcon}>🗺️</Text>
                <Text style={styles.locationText}>Current Location</Text>
                <Text style={styles.coordsText}>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </Text>
                <Text style={styles.noteText}>
                    Live map view (requires native build)
                </Text>
            </View>
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
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#e8f4f8',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    mapIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c5f7a',
        marginBottom: 8,
    },
    coordsText: {
        fontSize: 14,
        color: '#5a8ca0',
        fontFamily: 'monospace',
        marginBottom: 8,
    },
    noteText: {
        fontSize: 12,
        color: '#999',
        fontStyle: 'italic',
    },
    placeholderContainer: {
        width: '100%',
        height: 200,
        backgroundColor: '#e8f4f8',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    placeholderIcon: {
        fontSize: 48,
        marginBottom: 8,
    },
    placeholderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2c5f7a',
    },
});

export default LiveMap;
