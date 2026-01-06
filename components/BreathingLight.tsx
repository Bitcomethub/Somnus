import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    interpolateColor
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Mode-synchronized colors for the breathing aura
const MODE_COLORS: Record<string, string> = {
    commuter: '#f59e0b', // Amber/Gold for train
    office: '#3b82f6',   // Blue for deep work
    nomad: '#10b981',    // Emerald for forest
    sky: '#0ea5e9',      // Sky blue
    default: '#a855f7',   // Purple default
};

interface Props {
    isActive: boolean;
    color?: string;
    bpm?: number;
    mode?: string;
}

export default function BreathingLight({ isActive, color, bpm = 12, mode = 'default' }: Props) {
    const breatheProgress = useSharedValue(0);
    const glowOpacity = useSharedValue(0);

    const activeColor = color || MODE_COLORS[mode] || MODE_COLORS.default;

    useEffect(() => {
        if (isActive) {
            // Organic breathing animation - inhale/exhale
            const breathDuration = (60 / bpm) * 1000;

            breatheProgress.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: breathDuration * 0.4, easing: Easing.out(Easing.quad) }), // Inhale
                    withTiming(1, { duration: breathDuration * 0.1 }), // Hold
                    withTiming(0, { duration: breathDuration * 0.5, easing: Easing.in(Easing.quad) }), // Exhale
                ),
                -1,
                false
            );

            glowOpacity.value = withTiming(1, { duration: 1000 });
        } else {
            glowOpacity.value = withTiming(0, { duration: 500 });
        }
    }, [isActive, bpm]);

    const leftEdgeStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value * (0.15 + breatheProgress.value * 0.25),
        transform: [{ scaleX: 1 + breatheProgress.value * 0.3 }],
    }));

    const rightEdgeStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value * (0.15 + breatheProgress.value * 0.25),
        transform: [{ scaleX: 1 + breatheProgress.value * 0.3 }],
    }));

    const topEdgeStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value * (0.1 + breatheProgress.value * 0.15),
    }));

    const bottomEdgeStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value * (0.2 + breatheProgress.value * 0.3),
    }));

    if (!isActive) return null;

    return (
        <View style={styles.container} pointerEvents="none">
            {/* Left Edge Glow */}
            <Animated.View style={[styles.leftEdge, leftEdgeStyle]}>
                <LinearGradient
                    colors={[activeColor, 'transparent']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
            </Animated.View>

            {/* Right Edge Glow */}
            <Animated.View style={[styles.rightEdge, rightEdgeStyle]}>
                <LinearGradient
                    colors={['transparent', activeColor]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                />
            </Animated.View>

            {/* Top Edge Glow */}
            <Animated.View style={[styles.topEdge, topEdgeStyle]}>
                <LinearGradient
                    colors={[activeColor, 'transparent']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>

            {/* Bottom Edge Glow - Strongest (like candlelight from below) */}
            <Animated.View style={[styles.bottomEdge, bottomEdgeStyle]}>
                <LinearGradient
                    colors={['transparent', activeColor]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    leftEdge: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 80,
    },
    rightEdge: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 80,
    },
    topEdge: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
    },
    bottomEdge: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 120,
    },
});
