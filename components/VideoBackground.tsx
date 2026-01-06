import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface Props {
    source: any; // Video source (require or uri)
    isActive: boolean;
}

export default function VideoBackground({ source, isActive }: Props) {
    const videoRef = useRef<Video>(null);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isActive && source) {
            opacity.value = withTiming(1, { duration: 1000 });
            videoRef.current?.playAsync();
        } else {
            opacity.value = withTiming(0, { duration: 1000 });
            // Optional: videoRef.current?.pauseAsync(); // Keep playing for smooth fade or pause to save battery
        }
    }, [isActive, source]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    if (!source) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]} pointerEvents="none">
            <Video
                ref={videoRef}
                style={styles.video}
                source={source}
                resizeMode={ResizeMode.COVER}
                isLooping
                isMuted={true} // Audio is handled by the Mixer
                shouldPlay={isActive}
            />
            {/* Overlay to darken video for readability */}
            <View style={styles.overlay} />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1, // Behind everything
        backgroundColor: '#000',
    },
    video: {
        width: width,
        height: height,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(15, 23, 42, 0.6)', // Tingle BG color with opacity
    },
});
