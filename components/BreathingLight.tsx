import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

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
            // "Organic" Breath: Inhale (3s) -> Hold (0.5s) -> Exhale (4s) -> Hold (1s)
            // Using a sequence to break the mechanical sine wave feel
            opacity.value = withRepeat(
                withSequence(
                    withTiming(0.2, { duration: 3000, easing: Easing.out(Easing.quad) }), // Inhale
                    withTiming(0.2, { duration: 500 }), // Hold Breath
                    withTiming(0.05, { duration: 4000, easing: Easing.in(Easing.quad) }), // Exhale
                    withTiming(0.05, { duration: 1000 }) // Empty Lungs
                ),
                -1, // Infinite
                false
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
