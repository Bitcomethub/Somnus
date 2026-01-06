import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Moon, Clock, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import * as Brightness from 'expo-brightness';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const TIMER_OPTIONS = [
    { label: '15 min', minutes: 15 },
    { label: '30 min', minutes: 30 },
    { label: '45 min', minutes: 45 },
    { label: '60 min', minutes: 60 },
];

interface Props {
    visible: boolean;
    onClose: () => void;
    onSleepStart: (durationMs: number) => void; // Callback to start fade
    currentSound: any; // Audio.Sound reference for fading
}

export default function SleepTimer({ visible, onClose, onSleepStart, currentSound }: Props) {
    const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0); // Seconds
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const originalBrightness = useRef<number>(1);

    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(visible ? 1 : 0, { duration: 300 });

        // Store original brightness when opening
        if (visible) {
            Brightness.getBrightnessAsync().then(b => {
                originalBrightness.current = b;
            });
        }
    }, [visible]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => prev - 1);

                // Gradual fade in last 5 minutes (300 seconds)
                if (timeLeft <= 300) {
                    const progress = timeLeft / 300; // 1 -> 0

                    // Fade brightness
                    if (Platform.OS === 'ios') {
                        Brightness.setBrightnessAsync(originalBrightness.current * progress);
                    }

                    // Fade audio volume
                    if (currentSound) {
                        currentSound.setVolumeAsync(0.8 * progress);
                    }
                }
            }, 1000);
        } else if (isActive && timeLeft === 0) {
            // Timer finished
            setIsActive(false);
            if (currentSound) {
                currentSound.setVolumeAsync(0);
            }
            if (Platform.OS === 'ios') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            onClose();
        }

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isActive, timeLeft]);

    const handleStart = (minutes: number) => {
        setSelectedMinutes(minutes);
        setTimeLeft(minutes * 60);
        setIsActive(true);
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onSleepStart(minutes * 60 * 1000);
    };

    const handleCancel = () => {
        setIsActive(false);
        setTimeLeft(0);
        setSelectedMinutes(null);
        // Restore brightness
        if (Platform.OS === 'ios') {
            Brightness.setBrightnessAsync(originalBrightness.current);
        }
        if (currentSound) {
            currentSound.setVolumeAsync(0.8);
        }
        onClose();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        pointerEvents: visible ? 'auto' : 'none' as any,
    }));

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <BlurView intensity={90} tint="dark" style={styles.modal}>
                <View style={styles.header}>
                    <Moon size={24} color="#fbbf24" />
                    <Text style={styles.title}>Uyku Zamanlayıcı</Text>
                    <TouchableOpacity onPress={handleCancel} style={styles.closeBtn}>
                        <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                {!isActive ? (
                    <View style={styles.options}>
                        {TIMER_OPTIONS.map((option) => (
                            <TouchableOpacity
                                key={option.minutes}
                                style={styles.optionBtn}
                                onPress={() => handleStart(option.minutes)}
                            >
                                <Clock size={16} color="#a855f7" />
                                <Text style={styles.optionText}>{option.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : (
                    <View style={styles.timerDisplay}>
                        <Text style={styles.countdown}>{formatTime(timeLeft)}</Text>
                        <Text style={styles.fadeNote}>
                            {timeLeft <= 300 ? '🌙 Yavaşça uykuya geçiş...' : 'Son 5 dk\'da yavaşça söner'}
                        </Text>
                        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
                            <Text style={styles.cancelText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </BlurView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        width: '85%',
        borderRadius: 24,
        padding: 24,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 1,
        marginLeft: 12,
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    optionBtn: {
        width: '47%',
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(168,85,247,0.3)',
    },
    optionText: {
        color: '#fff',
        marginLeft: 8,
        fontWeight: '500',
    },
    timerDisplay: {
        alignItems: 'center',
    },
    countdown: {
        color: '#fbbf24',
        fontSize: 48,
        fontWeight: '200',
        letterSpacing: 4,
        marginBottom: 8,
    },
    fadeNote: {
        color: '#94a3b8',
        fontSize: 12,
        marginBottom: 24,
    },
    cancelBtn: {
        backgroundColor: 'rgba(239,68,68,0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(239,68,68,0.3)',
    },
    cancelText: {
        color: '#ef4444',
        fontWeight: '500',
    },
});
