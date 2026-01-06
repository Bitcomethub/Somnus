import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Simplified Visual Calibrator - removes GestureDetector to avoid React errors
// Just a decorative breathing light element
export default function VisualCalibrator() {
    const opacity = useSharedValue(0.3);

    React.useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.6, { duration: 2000 }),
                withTiming(0.3, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    // Disabled for now - was causing React internal errors
    return null;

    // Original decorative element (commented out for stability):
    // return (
    //     <View style={StyleSheet.absoluteFill} pointerEvents="none">
    //         <Animated.View style={[styles.thumbLight, animatedStyle]} />
    //     </View>
    // );
}

const styles = StyleSheet.create({
    thumbLight: {
        position: 'absolute',
        top: 100,
        left: width / 2 - 40,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(139, 92, 246, 0.3)',
    },
});
