import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming, withDelay, runOnJS } from 'react-native-reanimated';

interface Props {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: Props) {
    const opacity1 = useSharedValue(0);
    const opacity2 = useSharedValue(0);

    const style1 = useAnimatedStyle(() => ({ opacity: opacity1.value }));
    const style2 = useAnimatedStyle(() => ({ opacity: opacity2.value }));

    useEffect(() => {
        // Sequence: 
        // 1. Text 1 Fade In (1s) -> Hold (2s) -> Fade Out (1s)
        // 2. Text 2 Fade In (1s) -> Hold (2s) -> Fade Out (1s) -> Finish

        opacity1.value = withSequence(
            withTiming(1, { duration: 1500 }),
            withDelay(2000, withTiming(0, { duration: 1000 }))
        );

        opacity2.value = withDelay(4500, withSequence(
            withTiming(1, { duration: 1500 }),
            withDelay(2000, withTiming(0, { duration: 1000 }, (finished) => {
                if (finished) runOnJS(onFinish)();
            }))
        ));

    }, []);

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.textContainer, style1]}>
                <Text style={styles.text}>Dünyanın gürültüsünü dışarıda bırakmaya hazır mısın?</Text>
            </Animated.View>

            <Animated.View style={[styles.textContainer, style2]}>
                <Text style={styles.text}>Kendi sığınağına hoş geldin.</Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    textContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    text: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: '300',
        fontFamily: 'System', // Use a thin font if available
        textAlign: 'center',
        lineHeight: 36,
        letterSpacing: 1.5,
    }
});
