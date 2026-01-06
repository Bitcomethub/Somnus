import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Props {
    source: any;
    isActive: boolean;
}

// Simple gradient background (Video disabled for SDK compatibility)
export default function VideoBackground({ source, isActive }: Props) {
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isActive && source) {
            opacity.value = withTiming(0.3, { duration: 1000 });
        } else {
            opacity.value = withTiming(0, { duration: 1000 });
        }
    }, [isActive, source]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!source) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
            <View style={styles.gradient} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
        backgroundColor: '#0f0c29',
    },
    gradient: {
        width: width,
        height: height,
        backgroundColor: '#1a1a2e',
    },
});
