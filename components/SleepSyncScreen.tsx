import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
} from 'react-native-reanimated';
import { Moon, Power, ShieldAlert, X } from 'lucide-react-native';
import io from 'socket.io-client';
import { API_URL } from '@/constants/API';
import * as Brightness from 'expo-brightness';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

interface WaveProps {
    color: string;
    scaleVal: Animated.SharedValue<number>;
}

const Wave = ({ color, scaleVal }: WaveProps) => {
    const style = useAnimatedStyle(() => ({
        transform: [{ scale: scaleVal.value }],
        opacity: 0.15
    }));
    return (
        <Animated.View style={[styles.wave, { backgroundColor: color }, style]} />
    );
};

interface Props {
    visible: boolean;
    onClose: () => void;
    roomId?: string;
}

export default function SleepSyncScreen({ visible, onClose, roomId = "somnus_room_1" }: Props) {
    // ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURNS
    const socket = useRef<any>(null);
    const [status, setStatus] = useState('S O M N U S');
    const originalBrightnessRef = useRef<number | undefined>(undefined);

    const myWave = useSharedValue(1);
    const partnerWave = useSharedValue(1);

    // Experience: Screen Dimmer & Graceful Exit
    useEffect(() => {
        if (!visible) return;

        const setupExperience = async () => {
            // 1. Background Audio Setup
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                });
            } catch (e) {
                console.log("Audio mode error", e);
            }

            // 2. Dim Screen (iOS only)
            if (Platform.OS === 'ios') {
                try {
                    const { status } = await Brightness.requestPermissionsAsync();
                    if (status === 'granted') {
                        originalBrightnessRef.current = await Brightness.getBrightnessAsync();
                        await Brightness.setBrightnessAsync(0.05); // Dim to 5%
                    }
                } catch (e) { console.log('Brightness error', e); }
            }
        };

        setupExperience();

        return () => {
            // Graceful Cleanup
            if (originalBrightnessRef.current !== undefined) {
                Brightness.setBrightnessAsync(originalBrightnessRef.current);
            }
        };
    }, [visible]);

    // Socket connection
    useEffect(() => {
        if (!visible) return;

        socket.current = io(API_URL);
        socket.current.emit('join_sleep_room', roomId);

        socket.current.on('sync_play', () => {
            setStatus('Partner is syncing...');
        });

        socket.current.on('sync_pulse', (data: { amplitude: number }) => {
            partnerWave.value = withSpring(data.amplitude, { damping: 10, stiffness: 80 });
            myWave.value = withSpring(data.amplitude * 0.9, { damping: 12, stiffness: 90 });
        });

        return () => {
            socket.current?.disconnect();
        };
    }, [visible, roomId]);

    const handlePanic = () => {
        setStatus("BLOCKING...");
        setTimeout(() => {
            if (socket.current) socket.current.disconnect();
            onClose();
        }, 500);
    };

    // CONDITIONAL RETURN AFTER ALL HOOKS
    if (!visible) return null;

    return (
        <View style={styles.container}>
            {/* Ultra-Dark OLED Background */}
            <View style={styles.background} />

            {/* TOP: Close Button - Very prominent */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={28} color="#fff" />
            </TouchableOpacity>

            {/* Panic/Block Button - Top Right */}
            <TouchableOpacity style={styles.panicButton} onPress={handlePanic}>
                <ShieldAlert color="#ef4444" size={20} />
                <Text style={styles.panicText}>ENGELLE</Text>
            </TouchableOpacity>

            {/* Visualizer: Dual Waves */}
            <View style={styles.visualizerContainer}>
                <Wave color="#A855F7" scaleVal={myWave} />
                <Wave color="#3B82F6" scaleVal={partnerWave} />

                <View style={styles.core}>
                    <Moon size={32} color="rgba(255,255,255,0.5)" />
                </View>
            </View>

            <View style={styles.textContainer}>
                <Text style={styles.statusText}>{status}</Text>
                <Text style={styles.subSlogan}>Cinsellik değil, duyusal bir ortaklık.</Text>
                <Text style={styles.subSlogan}>Yalnız Uyumaya Elveda.</Text>
            </View>

            {/* Bottom: Leave Button - More prominent */}
            <TouchableOpacity style={styles.leaveButton} onPress={onClose}>
                <Power color="#a855f7" size={28} />
                <Text style={styles.leaveText}>Sessizce Ayrıl</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#09090B',
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
    },
    leaveButton: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
        backgroundColor: 'rgba(168, 85, 247, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    leaveText: {
        color: '#a855f7',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: '500',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 24,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    panicButton: {
        position: 'absolute',
        top: 50,
        right: 24,
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        flexDirection: 'row',
        gap: 6,
    },
    panicText: {
        color: '#ef4444',
        fontSize: 11,
        fontWeight: 'bold',
    }
});
