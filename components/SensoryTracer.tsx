import * as Haptics from 'expo-haptics';
import { useRef } from 'react';
import { Animated, PanResponder, Text, View } from 'react-native';

export default function SensoryTracer() {
    const lastHaptic = useRef(0);
    const scale = useRef(new Animated.Value(1)).current;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (evt, gestureState) => {
            const now = Date.now();
            // Throttle haptics to every 100ms
            if (now - lastHaptic.current > 100) {
                // Variation based on velocity
                const speed = Math.sqrt(gestureState.vx ** 2 + gestureState.vy ** 2);
                if (speed > 1.5) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                } else if (speed > 0.5) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                } else {
                    Haptics.selectionAsync();
                }
                lastHaptic.current = now;
            }

            Animated.spring(scale, {
                toValue: 1.2,
                useNativeDriver: true,
            }).start();
        },
        onPanResponderRelease: () => {
            Animated.spring(scale, {
                toValue: 1,
                useNativeDriver: true,
            }).start();
        }
    });

    return (
        <View className="px-6 mb-8">
            <Text className="text-gray-400 text-sm mb-4 tracking-wider uppercase font-medium italic">Tactile Trace 🖐️</Text>
            <Animated.View
                {...panResponder.panHandlers}
                style={{ transform: [{ scale }] }}
                className="h-32 bg-tingle-card/40 rounded-3xl border border-white/5 items-center justify-center overflow-hidden"
            >
                <View className="absolute inset-0 bg-purple-500/5 opacity-20" />
                <Text className="text-gray-500 text-xs text-center px-10">
                    Parmağını burada gezdir...{"\n"}Hissiyatı keşfet.
                </Text>
            </Animated.View>
        </View>
    );
}
