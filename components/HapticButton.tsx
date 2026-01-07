import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface Props extends TouchableOpacityProps {
    hapticStyle?: 'light' | 'medium' | 'heavy' | 'soft' | 'rigid';
    glowColor?: string;
    showGlow?: boolean;
    children: React.ReactNode;
}

/**
 * Premium Button with haptic feedback and visual press animation
 * Used throughout the app for consistent interaction feel
 */
export default function HapticButton({
    hapticStyle = 'light',
    glowColor = '#a855f7',
    showGlow = false,
    onPressIn,
    onPressOut,
    style,
    children,
    ...props
}: Props) {
    const scale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    const handlePressIn = (e: any) => {
        // Visual feedback - scale down slightly
        scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });

        // Glow intensify
        if (showGlow) {
            glowOpacity.value = withTiming(0.6, { duration: 100 });
        }

        // Haptic feedback
        if (Platform.OS === 'ios') {
            const feedbackMap = {
                light: Haptics.ImpactFeedbackStyle.Light,
                medium: Haptics.ImpactFeedbackStyle.Medium,
                heavy: Haptics.ImpactFeedbackStyle.Heavy,
                soft: Haptics.ImpactFeedbackStyle.Soft,
                rigid: Haptics.ImpactFeedbackStyle.Rigid,
            };
            Haptics.impactAsync(feedbackMap[hapticStyle]);
        }

        onPressIn?.(e);
    };

    const handlePressOut = (e: any) => {
        // Visual feedback - scale back
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });

        // Glow fade
        if (showGlow) {
            glowOpacity.value = withTiming(0.2, { duration: 300 });
        }

        onPressOut?.(e);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    return (
        <AnimatedTouchable
            {...props}
            style={[style, animatedStyle]}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1} // We handle opacity ourselves
        >
            {showGlow && (
                <Animated.View
                    style={[
                        styles.glowLayer,
                        { backgroundColor: glowColor },
                        glowStyle
                    ]}
                    pointerEvents="none"
                />
            )}
            {children}
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    glowLayer: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        zIndex: -1,
    },
});
