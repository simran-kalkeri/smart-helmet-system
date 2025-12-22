import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CancelButtonProps {
    onCancel: () => void;
    onTimeout: () => void;
    duration?: number; // in seconds
}

const CancelButton: React.FC<CancelButtonProps> = ({
    onCancel,
    onTimeout,
    duration = 10,
}) => {
    const [timeLeft, setTimeLeft] = useState(duration);
    const startTimeRef = React.useRef<number>(Date.now());
    const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
    const isActiveRef = React.useRef<boolean>(true);

    useEffect(() => {
        startTimeRef.current = Date.now();
        isActiveRef.current = true;

        const updateTimer = () => {
            if (!isActiveRef.current) return;

            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const remaining = Math.max(0, duration - elapsed);

            setTimeLeft(Math.ceil(remaining));

            if (remaining <= 0) {
                onTimeout();
            } else {
                // Use setTimeout recursively for more reliable timing
                timeoutRef.current = setTimeout(updateTimer, 100);
            }
        };

        updateTimer();

        return () => {
            isActiveRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [duration, onTimeout]);

    const handleCancel = () => {
        isActiveRef.current = false;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        onCancel();
    };

    return (
        <View style={styles.container}>
            <View style={styles.alertBox}>
                <Text style={styles.alertIcon}>⚠️</Text>
                <Text style={styles.alertTitle}>Accident Detected!</Text>
                <Text style={styles.alertMessage}>
                    Are you okay? Press cancel if this is a false alarm.
                </Text>

                <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{timeLeft}</Text>
                    <Text style={styles.timerLabel}>seconds remaining</Text>
                </View>

                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>I'M OKAY - CANCEL ALERT</Text>
                </TouchableOpacity>

                <Text style={styles.warningText}>
                    If you don't respond, emergency services will be notified
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    alertBox: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    alertIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    alertTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#d32f2f',
        marginBottom: 12,
        textAlign: 'center',
    },
    alertMessage: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    timerContainer: {
        backgroundColor: '#fff3e0',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        minWidth: 120,
        alignItems: 'center',
    },
    timerText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#f57c00',
    },
    timerLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    cancelButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        width: '100%',
        marginBottom: 16,
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    warningText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});

export default CancelButton;
