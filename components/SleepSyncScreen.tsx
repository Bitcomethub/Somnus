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
import { Moon, Power, ShieldAlert } from 'lucide-react-native';
import io from 'socket.io-client';
import { API_URL } from '@/constants/API';
import * as Brightness from 'expo-brightness';
import { Audio } from 'expo-av';

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

    // Experience: Screen Dimmer & Graceful Exit
    useEffect(() => {
        let originalBrightness: number;
        
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

             // 2. Dim Screen
             try {
                 const { status } = await Brightness.requestPermissionsAsync();
                 if (status === 'granted') {
                     originalBrightness = await Brightness.getBrightnessAsync();
                     await Brightness.setBrightnessAsync(0.05); // Dim to 5%
                 }
             } catch (e) { console.log('Brightness error', e); }
        };

        setupExperience();

        return () => {
            // Graceful Cleanup
            if (originalBrightness !== undefined) {
                Brightness.setBrightnessAsync(originalBrightness); // Restore
            }
            // Cleanup function for audio fade-out would go here
            console.log("Graceful Disconnect: Fading out audio...");
        };
    }, []);

    const handlePanic = () => {
        // Immediate Block & Leave
        setStatus("BLOCKING...");
        
        setTimeout(() => {
    if (socket.current) socket.current.disconnect();
    onClose();
}, 500);
    };

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
            <Power color="#64748b" size={24} />
            <Text style={styles.leaveText}>Leave Quietly</Text>
        </TouchableOpacity>

        {/* Panic Button */}
        <TouchableOpacity style={styles.panicButton} onPress={handlePanic}>
            <ShieldAlert color="#ef4444" size={20} />
            <Text style={styles.panicText}>BLOCK</Text>
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
    },
    panicButton: {
        position: 'absolute',
        top: 60,
        right: 30,
        alignItems: 'center',
        opacity: 0.8,
        flexDirection: 'column',
    },
    panicText: {
        color: '#ef4444',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 4,
    }
});
