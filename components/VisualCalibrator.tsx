import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function VisualCalibrator() {
    const x = useSharedValue(width / 2);
    const y = useSharedValue(100);
    const scale = useSharedValue(1);

    const gesture = Gesture.Pan()
        .onUpdate((e) => {
            x.value = e.absoluteX;
            y.value = e.absoluteY;
        })
        .onBegin(() => {
            scale.value = withSpring(1.5);
        })
        .onFinalize(() => {
            scale.value = withSpring(1);
        });

    // Breathing glow effect
    React.useEffect(() => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.2, { duration: 2000 }),
                withTiming(1, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: x.value - 40 }, // Center offset
            { translateY: y.value - 40 },
            { scale: scale.value }
        ],
    }));

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.thumbLight, animatedStyle]}>
                    <View style={styles.core} />
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    thumbLight: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(139, 92, 246, 0.3)', // Soft Lavender Glow
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
    },
    core: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#FFFFFF',
        shadowColor: '#FFFFFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
});
