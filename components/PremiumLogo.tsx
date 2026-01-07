import React, { useEffect } from 'react';
import { View, Image, Text, StyleSheet, Dimensions, ImageBackground } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Mode-synchronized glow colors
const MODE_GLOW_COLORS: Record<string, string> = {
    commuter: '#f59e0b', // Amber for train
    office: '#3b82f6',   // Blue for deep work
    nomad: '#10b981',    // Emerald for forest
    sky: '#0ea5e9',      // Sky blue
    default: '#a855f7',   // Purple default
};

interface Props {
    mode?: string;
}

export default function PremiumLogo({ mode = 'default' }: Props) {
    const glowOpacity = useSharedValue(0.2);
    const glowScale = useSharedValue(1);

    const glowColor = MODE_GLOW_COLORS[mode] || MODE_GLOW_COLORS.default;

    useEffect(() => {
        // Subtle breathing glow animation
        glowOpacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 2000 }),
                withTiming(0.2, { duration: 2000 })
            ),
            -1,
            true
        );
        glowScale.value = withRepeat(
            withSequence(
                withTiming(1.02, { duration: 2000 }),
                withTiming(1, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
        transform: [{ scale: glowScale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Outer Glow Effect Layer */}
            <Animated.View style={[styles.outerGlow, { backgroundColor: glowColor }, glowStyle]} />

            {/* Frosted Glass Pedestal with Logo */}
            <BlurView intensity={25} tint="dark" style={styles.glassPedestal}>
                {/* 
                    Using the logo image - the dark background (#1c1b3b) 
                    closely matches our app background (#0f0c29)
                    so blending will look natural
                */}
                <View style={styles.logoWrapper}>
                    <Image
                        source={require('../assets/somnus-logo-full.jpg')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>

                {/* Soft vignette overlay to blend edges - MUST NOT BLOCK TOUCHES */}
                <View style={styles.vignetteOverlay} pointerEvents="none" />
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    outerGlow: {
        position: 'absolute',
        width: width * 0.75,
        height: 140,
        borderRadius: 30,
        opacity: 0.2,
    },
    glassPedestal: {
        width: width * 0.7,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
        backgroundColor: 'rgba(15,12,41,0.4)', // Match app BG
    },
    logoWrapper: {
        borderRadius: 20,
        overflow: 'hidden',
    },
    logo: {
        width: width * 0.65,
        height: 140,
    },
    vignetteOverlay: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 24,
        // Soft fade at edges
        borderWidth: 15,
        borderColor: 'rgba(15,12,41,0.6)',
    },
});
