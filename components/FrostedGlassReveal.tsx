import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Pressable, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolate,
    withRepeat,
    withSequence,
    Easing
} from 'react-native-reanimated';

// Animated BlurView wrapper
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface Props {
    children: React.ReactNode;
    revealProgress: number; // 0 (hidden) -> 1 (revealed)
    isPulsing?: boolean; // True when 'alive' / audio playing
}

export default function FrostedGlassReveal({ children, revealProgress, isPulsing = true }: Props) {
    // Shared Values
    const progress = useSharedValue(0);
    const pulse = useSharedValue(0);

    useEffect(() => {
        // Smooth cinematic transition (5s duration if triggered)
        progress.value = withTiming(revealProgress, { duration: 5000, easing: Easing.inOut(Easing.ease) });
    }, [revealProgress]);

    useEffect(() => {
        if (isPulsing && revealProgress < 1) {
            // Warm Glow Pulse (Heartbeat)
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 2000 }),
                    withTiming(0.5, { duration: 2000 })
                ),
                -1,
                true
            );
        } else {
            pulse.value = 0;
        }
    }, [isPulsing, revealProgress]);

    // Derived Styles
    const containerStyle = useAnimatedStyle(() => {
        const blurIntensity = interpolate(progress.value, [0, 1], [90, 0], Extrapolate.CLAMP);
        return {
            // Blur usage depends on platform capability, using opacity on container for simulation if needed
        };
    });

    // Since AnimatedBlurView intensity prop interpolation creates issues on some Expo versions,
    // We control opacity of the blur layer instead.
    const blurLayerStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.8, 1], [1, 0.2, 0]),
    }));

    const frostOverlayStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.5], [0.6, 0]), // Frost melts fast
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0.8, 0]), // Glow fades as reveal happens
        transform: [{ scale: interpolate(pulse.value, [0.5, 1], [0.95, 1.05]) }]
    }));

    return (
        <View style={styles.container}>
            {/* 1. Base Content (Video/Image) */}
            <View style={styles.content}>
                {children}
            </View>

            {/* 2. Warm Pulse Glow (Behind Frost) */}
            <Animated.View style={[styles.glowContainer, glowStyle]}>
                <View style={styles.glowOrb} />
            </Animated.View>

            {/* 3. Blur Layer (The 'Ice') */}
            <AnimatedBlurView
                intensity={90}
                tint="dark"
                style={[StyleSheet.absoluteFill, blurLayerStyle]}
            />

            {/* 4. Frost Texture Overlay (Optional - Using simple noise simulation with opacity) */}
            <Animated.View style={[styles.frostOverlay, frostOverlayStyle]}>
                <View style={styles.frostNoise} />
                {/* Could be an Image with source={require('frost.png')} */}
            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 20, // Match profile card
    },
    content: {
        width: '100%',
        height: '100%',
    },
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    glowOrb: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#fbbf24', // Warm Amber
        opacity: 0.3,
        shadowColor: '#f59e0b',
        shadowRadius: 40,
        shadowOpacity: 0.8,
    },
    frostOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.05)', // Milky glass effect
        zIndex: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    frostNoise: {
        // Simulate noise via style or simple grain if image not available
        width: '100%',
        height: '100%',
        opacity: 0.3,
        backgroundColor: '#fff',
    }
});
