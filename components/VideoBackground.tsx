import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat, withSequence } from 'react-native-reanimated';
// Note: Using placeholder for video - expo-video requires native build
// For Expo Go, we'll use animated gradient backgrounds instead

const { width, height } = Dimensions.get('window');

// Mode-specific color palettes for the "living canvas" effect
const MODE_GRADIENTS: Record<string, string[]> = {
    commuter: ['#0a0a0f', '#1a1a3e', '#0a0a0f'], // Deep night blue
    office: ['#0f0a1a', '#1e1a3f', '#0f0a1a'], // Purple focus
    nomad: ['#0a1510', '#0f2820', '#0a1510'], // Deep forest
    sky: ['#0a1520', '#102030', '#0a1520'], // Sky at night
    default: ['#0f0c29', '#0f0c29', '#0f0c29'], // Base dark
};

interface Props {
    source: any;
    isActive: boolean;
    mode?: string;
}

export default function VideoBackground({ source, isActive, mode = 'default' }: Props) {
    const opacity = useSharedValue(0);
    const shimmerPosition = useSharedValue(0);

    useEffect(() => {
        if (isActive && source) {
            opacity.value = withTiming(1, { duration: 1500 });
            // Subtle shimmer animation for "living" feel
            shimmerPosition.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 8000 }),
                    withTiming(0, { duration: 8000 })
                ),
                -1,
                true
            );
        } else {
            opacity.value = withTiming(0.3, { duration: 1000 });
        }
    }, [isActive, source]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    const gradientColors = MODE_GRADIENTS[mode || 'default'] || MODE_GRADIENTS.default;

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Base Layer - Animated Gradient (simulates video) */}
            <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
                <LinearGradient
                    colors={gradientColors as any}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Vignette Overlay - Darkens edges for depth */}
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.3)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />

            {/* Content Readability Layer - 30% opacity gradient */}
            <LinearGradient
                colors={['rgba(0,0,0,0.4)', 'transparent', 'rgba(0,0,0,0.6)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
        backgroundColor: '#0f0c29', // Fallback
    },
});
