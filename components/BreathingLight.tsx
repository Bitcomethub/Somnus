import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Props {
    isActive: boolean;
    color?: string; // e.g. '#a855f7' for purple pulse
    bpm?: number;
}

export default function BreathingLight({ isActive, color = '#a855f7', bpm = 12 }: Props) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            // Breathing Rhythm: 60/12 = 5 seconds per cycle
            // Inhale (Fade In) -> Exhale (Fade Out)
            opacity.value = withRepeat(
                withTiming(0.15, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
                -1, // Infinite
                true // Reverse (Auto-inhale/exhale)
            );
        } else {
            opacity.value = withTiming(0, { duration: 1000 });
        }
    }, [isActive, bpm]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        backgroundColor: color,
    }));

    if (!isActive) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none" />
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0, // Above background, below content
    },
});
