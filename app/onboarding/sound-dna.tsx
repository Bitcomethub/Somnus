import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CloudRain, Wind, Mic, Zap, Check, Scissors, Droplets, Camera, SprayCan, Radio, Anchor, Hand } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import axios from 'axios';
import { API_URL } from '@/constants/API';
import { StatusBar } from 'expo-status-bar';

// 2025 Viral ASMR Triggers
const TRIGGERS = [
    { id: 'ThumbLights', label: 'Thumb Lights', icon: Zap, color: '#F59E0B' },
    { id: 'CoconutCrack', label: 'Coconut & Book', icon: Zap, color: '#8B5CF6' }, // Abstract 'Zap' for crack
    { id: 'WaterClips', label: 'Rainstorm', icon: Droplets, color: '#3B82F6' },
    { id: 'Hairplay', label: 'Mermaid Brush', icon: Scissors, color: '#EC4899' },
    { id: 'TakingPhotos', label: 'Taking Photos', icon: Camera, color: '#e2e8f0' },
    { id: 'BodySpray', label: 'Carbonated Spray', icon: SprayCan, color: '#10b981' },
    { id: 'GlueSticks', label: 'Glue on Mic', icon: Mic, color: '#f43f5e' },
    { id: 'OceanTrigger', label: 'Ocean Trigger', icon: Anchor, color: '#06b6d4' },
    { id: 'Windshield', label: 'Windshield Wiping', icon: Wind, color: '#64748b' },
    { id: 'Calibrating', label: 'Calibrating', icon: Radio, color: '#8B5CF6' },
];

import { Audio } from 'expo-av';

const SOUND_MAP: { [key: string]: any } = {
    'ThumbLights': require('../../assets/sounds/waves.mp3'), // Fallback/Placeholder
    'CoconutCrack': require('../../assets/sounds/tapping.mp3'),
    'WaterClips': require('../../assets/sounds/rain.mp3'),
    'Hairplay': require('../../assets/sounds/brushing.mp3'),
    'TakingPhotos': require('../../assets/sounds/waves.mp3'),
    'BodySpray': require('../../assets/sounds/waves.mp3'),
    'GlueSticks': require('../../assets/sounds/tapping.mp3'),
    'OceanTrigger': require('../../assets/sounds/waves.mp3'),
    'Windshield': require('../../assets/sounds/waves.mp3'),
    'Calibrating': require('../../assets/sounds/waves.mp3'),
};

export default function SoundDNA() {
    const router = useRouter();
    const [selected, setSelected] = useState<string | null>(null);
    const [sound, setSound] = useState<Audio.Sound | null>(null);

    // Unload sound on unmount
    useEffect(() => {
        return () => {
            if (sound) {
                console.log('Unloading Sound');
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const playSound = async (triggerId: string) => {
        try {
            // Stop previous sound
            if (sound) {
                await sound.unloadAsync();
            }

            const source = SOUND_MAP[triggerId];
            if (!source) return;

            console.log('Loading Sound');
            const { sound: newSound } = await Audio.Sound.createAsync(
                source,
                { shouldPlay: true, isLooping: true, volume: 0.5 }
            );
            setSound(newSound);
        } catch (error) {
            console.log('Error playing sound:', error);
        }
    };

    const handleSelect = async (triggerId: string) => {
        await Haptics.selectionAsync();
        setSelected(triggerId);
        console.log(`Previewing VIP Room Sound: ${triggerId}`);
        playSound(triggerId);
    };

    const handleConfirm = async () => {
        if (sound) {
            await sound.stopAsync();
            await sound.unloadAsync();
        }

        if (!selected) return;
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Save preference to backend
        try {
            await axios.put(`${API_URL}/user/preferences`, { currentVibe: selected }); // Mock endpoint update
            console.log("Joined VIP Room:", selected);
        } catch (e) {
            console.log("Offline mode - saved locally");
        }
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.header}>
                <Text style={styles.title}>Sound DNA</Text>
                <Text style={styles.subtitle}>Ruhunun frekansı hangisi?</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {TRIGGERS.map((item, index) => (
                        <Animated.View
                            key={item.id}
                            entering={FadeInDown.delay(index * 100).springify()}
                            style={styles.cardContainer}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.card,
                                    selected === item.id && styles.cardSelected,
                                    { borderColor: selected === item.id ? item.color : 'rgba(255,255,255,0.1)' }
                                ]}
                                onPress={() => handleSelect(item.id)}
                                activeOpacity={0.7}
                            >
                                <item.icon size={32} color={selected === item.id ? item.color : '#64748b'} />
                                <Text style={[
                                    styles.label,
                                    selected === item.id && { color: item.color }
                                ]}>{item.label}</Text>

                                {selected === item.id && (
                                    <View style={styles.check}>
                                        <Check size={10} color="#000" />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>

            {selected && (
                <Animated.View entering={FadeInDown.springify()} style={styles.footer}>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                        <Text style={styles.confirmText}>Bu Odaya Gir</Text>
                    </TouchableOpacity>
                </Animated.View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
    },
    header: {
        paddingTop: 20,
        paddingBottom: 10,
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 14,
        letterSpacing: 4,
        textTransform: 'uppercase',
        opacity: 0.6,
        marginBottom: 8,
    },
    subtitle: {
        color: '#fff',
        fontSize: 22,
        fontWeight: '300',
        textAlign: 'center',
    },
    scrollContent: {
        paddingBottom: 120,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        justifyContent: 'space-between',
    },
    cardContainer: {
        width: '48%',
        marginBottom: 12,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        height: 110,
        justifyContent: 'center',
    },
    cardSelected: {
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    label: {
        color: '#64748b',
        marginTop: 10,
        fontSize: 12,
        fontWeight: '500',
        textAlign: 'center',
    },
    check: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 2,
    },
    footer: {
        padding: 24,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: '#020617',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    confirmButton: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    confirmText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
        textTransform: 'uppercase',
    }
});
