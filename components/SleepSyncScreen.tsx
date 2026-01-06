```
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    Easing
} from 'react-native-reanimated';
import { Moon, Power } from 'lucide-react-native';
import io from 'socket.io-client';
import { API_URL } from '@/constants/API';

const { width } = Dimensions.get('window');

const Wave = ({ color, duration, scaleVal }: { color: string, duration: number, scaleVal: Animated.SharedValue<number> }) => {
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scaleVal.value }],
        opacity: 0.15
    }));
    return (
        <Animated.View style={[styles.wave, { backgroundColor: color }, style]} />
    );
};

export default function SleepSyncScreen({ visible, onClose, roomId = "somnus_room_1" }: { visible: boolean, onClose: () => void, roomId?: string }) {
    if (!visible) return null;

    const socket = useRef<any>(null);
    const [status, setStatus] = useState('S O M N U S');

    const myWave = useSharedValue(1);
    const partnerWave = useSharedValue(1);

    useEffect(() => {
        socket.current = io(API_URL);
        socket.current.emit('join_sleep_room', roomId);

        socket.current.on('sync_play', () => {
            setStatus('Partner is syncing...');
        });
        
        // Real-time Pulse Listener
        socket.current.on('sync_pulse', (data: { amplitude: number }) => {
            // Apply organic spring physics to the pulse
            partnerWave.value = withSpring(data.amplitude, { damping: 10, stiffness: 80 });
            myWave.value = withSpring(data.amplitude * 0.9, { damping: 12, stiffness: 90 }); // Slight variation
        });

        return () => {
            socket.current?.disconnect();
        };
    }, []);

    return (
        <View style={styles.container}>
            {/* Ultra-Dark OLED Background */}
            <View style={styles.background} />

            {/* Visualizer: Dual Waves */}
            <View style={styles.visualizerContainer}>
                <Wave color="#A855F7" duration={4500} scaleVal={myWave} />
                <Wave color="#3B82F6" duration={4500} scaleVal={partnerWave} />

                <View style={styles.core}>
                    <Moon size={32} color="rgba(255,255,255,0.5)" />
                </View>
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.statusText}>{status}</Text>
                <Text style={styles.subSlogan}>Cinsellik değil, duyusal bir ortaklık.</Text>
                <Text style={styles.subSlogan}>Yalnız Uyumaya Elveda.</Text>
            </View>

            <TouchableOpacity style={styles.leaveButton} onPress={onClose}>
                <Power color="#475569" size={24} />
                <Text style={styles.leaveText}>Leave Quietly</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#09090B', // OLED Black
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#09090B',
    },
    visualizerContainer: {
        width: width,
        height: width,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wave: {
        position: 'absolute',
        width: 250,
        height: 250,
        borderRadius: 125,
    },
    core: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#09090B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    textContainer: {
        marginTop: 60,
        alignItems: 'center',
    },
    statusText: {
        color: '#fff',
        fontSize: 18,
        letterSpacing: 6,
        marginBottom: 20,
        fontWeight: '300',
    },
    subSlogan: {
        color: '#475569',
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 8,
        fontFamily: 'System', // Elegant default
    },
    leaveButton: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
        opacity: 0.7,
        flexDirection: 'row',
        gap: 8,
    },
    leaveText: {
        color: '#475569',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 2,
    }
});
