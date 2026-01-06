import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing
} from 'react-native-reanimated';
import { Power, Volume2 } from 'lucide-react-native';
import io from 'socket.io-client';
import { API_URL } from '@/constants/API';

const { width } = Dimensions.get('window');

// Visualizer Wave Component
const Wave = ({ color, duration, scaleVal }: { color: string, duration: number, scaleVal: Animated.SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scaleVal.value }],
        opacity: 0.3
    }));
    return (
        <Animated.View style={[styles.wave, { backgroundColor: color }, style]} />
    );
};

export default function SleepDashboard({ visible, onClose, roomId = "sleep_room_1" }: { visible: boolean, onClose: () => void, roomId?: string }) {
    if (!visible) return null;

    const socket = useRef<any>(null);
    const [status, setStatus] = useState('Syncing...');

    // Animation Values
    const myWave = useSharedValue(1);
    const partnerWave = useSharedValue(1);

    useEffect(() => {
        // Connect to Sleep-Sync Engine
        socket.current = io(API_URL);

        socket.current.emit('join_sleep_room', roomId);

        socket.current.on('sync_play', (data: any) => {
            setStatus(`Partner playing ${data.trigger}`);
            partnerWave.value = withRepeat(withTiming(1.5, { duration: 2000 }), -1, true);
        });

        socket.current.on('sync_pause', () => {
            setStatus('Partner paused');
            partnerWave.value = withTiming(1);
        });

        socket.current.on('partner_left_quietly', () => {
            setStatus('Partner left quietly... 🌙');
            partnerWave.value = withTiming(1);
        });

        // Simulate my breathing/audio
        myWave.value = withRepeat(withTiming(1.3, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);

        return () => {
            socket.current?.disconnect();
        };
    }, []);

    const leaveQuietly = () => {
        socket.current?.emit('leave_quietly', { roomId });
        onClose();
    };

    return (
        <View style={styles.container}>
            {/* Ultra-Dark Background */}
            <View style={styles.background} />

            {/* Visualizer: Dual Waves */}
            <View style={styles.visualizerContainer}>
                <Wave color="#8B5CF6" duration={4000} scaleVal={myWave} />
                <Wave color="#3B82F6" duration={4000} scaleVal={partnerWave} />

                {/* Center Core */}
                <View style={styles.core}>
                    <Text style={styles.statusText}>{status}</Text>
                </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
                <TouchableOpacity style={styles.ghostButton} onPress={leaveQuietly}>
                    <Power color="#64748b" size={24} />
                    <Text style={styles.ghostText}>Leave Quietly</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#020617', // Deep Night Blue / Almost Black
        opacity: 0.98, // Slight transparency for immersion
    },
    visualizerContainer: {
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wave: {
        position: 'absolute',
        width: 150,
        height: 150,
        borderRadius: 75,
    },
    core: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#0f172a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        zIndex: 10,
    },
    statusText: {
        color: '#94a3b8',
        fontSize: 10,
        textAlign: 'center',
        maxWidth: 80,
    },
    controls: {
        position: 'absolute',
        bottom: 60,
        width: '100%',
        alignItems: 'center',
    },
    ghostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 30,
        gap: 10,
    },
    ghostText: {
        color: '#64748b',
        fontFamily: 'System', // Use default for now
        fontSize: 14,
    }
});
