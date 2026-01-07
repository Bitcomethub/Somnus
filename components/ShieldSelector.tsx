import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Train, Briefcase, Trees, Cloud } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
    withSpring
} from 'react-native-reanimated';

export type ShieldMode = 'commuter' | 'office' | 'nomad' | 'sky' | null;

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 80) / 4;

const SHIELDS = [
    { id: 'commuter', label: 'Midnight Train', icon: Train, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.4)', slogan: 'Rayların Ritmi', cost: 0 },
    { id: 'office', label: 'Deep Work', icon: Briefcase, color: '#3b82f6', glowColor: 'rgba(59,130,246,0.4)', slogan: 'Maksimum Odak', cost: 2 },
    { id: 'nomad', label: 'Forest Cabin', icon: Trees, color: '#10b981', glowColor: 'rgba(16,185,129,0.4)', slogan: 'Doğal İzolasyon', cost: 0 },
    { id: 'sky', label: 'Private Jet', icon: Cloud, color: '#0ea5e9', glowColor: 'rgba(14,165,233,0.4)', slogan: 'Bulutların Üstü', cost: 5 },
];

interface Props {
    activeMode: ShieldMode;
    onSelect: (mode: ShieldMode) => void;
    counts: Record<string, number>;
}

// Enhanced Shield Card with press animation and haptics
const ShieldCard = ({ item, isActive, onPress, count }: { item: typeof SHIELDS[0], isActive: boolean, onPress: () => void, count: number }) => {
    const glowOpacity = useSharedValue(0);
    const pressScale = useSharedValue(1);
    const pressGlow = useSharedValue(0.2);

    React.useEffect(() => {
        if (isActive) {
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.8, { duration: 1500 }),
                    withTiming(0.4, { duration: 1500 })
                ),
                -1,
                true
            );
        } else {
            glowOpacity.value = withTiming(0, { duration: 300 });
        }
    }, [isActive]);

    const handlePressIn = () => {
        // Visual feedback - scale down
        pressScale.value = withSpring(0.94, { damping: 15, stiffness: 400 });
        pressGlow.value = withTiming(0.6, { duration: 100 });

        // Haptic feedback - Soft for premium feel
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
        }
    };

    const handlePressOut = () => {
        // Visual feedback - scale back with bounce
        pressScale.value = withSpring(1, { damping: 15, stiffness: 400 });
        pressGlow.value = withTiming(0.2, { duration: 300 });
    };

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pressScale.value }],
    }));

    const pressGlowStyle = useAnimatedStyle(() => ({
        opacity: pressGlow.value,
    }));

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View style={cardAnimatedStyle}>
                {/* Glow Effect Layer - Active State */}
                <Animated.View style={[styles.glowLayer, { backgroundColor: item.glowColor }, glowStyle]} />

                {/* Press Glow - Intensifies on touch */}
                <Animated.View style={[styles.pressGlowLayer, { backgroundColor: item.color }, pressGlowStyle]} />

                <BlurView
                    intensity={isActive ? 40 : 20}
                    tint="dark"
                    style={[
                        styles.card,
                        isActive && { borderColor: item.color, borderWidth: 1 }
                    ]}
                >
                    {/* Icon Container */}
                    <View style={[
                        styles.iconContainer,
                        { backgroundColor: isActive ? item.color : 'rgba(255,255,255,0.1)' }
                    ]}>
                        <item.icon size={22} color={isActive ? '#fff' : '#94a3b8'} />
                    </View>

                    {/* Label */}
                    <Text style={[styles.label, isActive && { color: '#fff' }]} numberOfLines={2}>
                        {item.label}
                    </Text>

                    {/* Co-Presence Counter */}
                    <View style={styles.countContainer}>
                        <View style={[styles.dot, { backgroundColor: item.color }]} />
                        <Text style={styles.countText}>{count}</Text>
                    </View>

                    {/* Cost Badge (if premium) */}
                    {item.cost > 0 && (
                        <View style={styles.costBadge}>
                            <Text style={styles.costText}>{item.cost} 🔥</Text>
                        </View>
                    )}
                </BlurView>
            </Animated.View>
        </TouchableOpacity>
    );
};

export default function ShieldSelector({ activeMode, onSelect, counts }: Props) {
    const handleSelect = (itemId: string) => {
        // Secondary haptic on actual selection change
        if (Platform.OS === 'ios') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        onSelect(activeMode === itemId ? null : itemId as ShieldMode);
    };

    return (
        <View style={styles.container}>
            {/* Elegant Header */}
            <Text style={styles.header}>DUYUSAL ZIRHINI SEÇ</Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
            >
                {SHIELDS.map((item) => (
                    <ShieldCard
                        key={item.id}
                        item={item}
                        isActive={activeMode === item.id}
                        onPress={() => handleSelect(item.id)}
                        count={counts[item.id] || 0}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        marginTop: 8,
    },
    header: {
        color: '#94a3b8',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 3,
        marginLeft: 24,
        marginBottom: 16,
        fontWeight: '300',
        textAlign: 'left',
    },
    scroll: {
        paddingHorizontal: 16,
        gap: 12,
    },
    glowLayer: {
        position: 'absolute',
        top: -4,
        left: -4,
        right: -4,
        bottom: -4,
        borderRadius: 24,
        zIndex: -1,
    },
    pressGlowLayer: {
        position: 'absolute',
        top: -2,
        left: -2,
        right: -2,
        bottom: -2,
        borderRadius: 22,
        zIndex: -1,
    },
    card: {
        width: CARD_WIDTH,
        minWidth: 85,
        height: 120,
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        backgroundColor: 'rgba(30,41,59,0.6)',
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    label: {
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
        lineHeight: 14,
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    dot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        marginRight: 4,
    },
    countText: {
        color: '#cbd5e1',
        fontSize: 9,
        fontWeight: 'bold',
    },
    costBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 6,
    },
    costText: {
        color: '#fbbf24',
        fontSize: 8,
        fontWeight: 'bold',
    },
});
