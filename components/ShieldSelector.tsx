import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Train, Briefcase, Trees, Cloud, Zap, Flame } from 'lucide-react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

export type ShieldMode = 'commuter' | 'office' | 'nomad' | 'sky' | null;

const SHIELDS = [
    { id: 'commuter', label: 'Midnight Train', icon: Train, color: '#f59e0b', slogan: 'Rayların Ritmi', cost: 0 },
    { id: 'office', label: 'Deep Work', icon: Briefcase, color: '#3b82f6', slogan: 'Maksimum Odak (2 🔥)', cost: 2 },
    { id: 'nomad', label: 'Forest Cabin', icon: Trees, color: '#10b981', slogan: 'Doğal İzolasyon', cost: 0 },
    { id: 'sky', label: 'Private Jet', icon: Cloud, color: '#0ea5e9', slogan: 'Bulutların Üstü (5 🔥)', cost: 5 },
];

interface Props {
    activeMode: ShieldMode;
    onSelect: (mode: ShieldMode) => void;
    counts: Record<string, number>; // Co-presence counts
}

export default function ShieldSelector({ activeMode, onSelect, counts }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.header}>Duyusal Zırhını Seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                {SHIELDS.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onSelect(activeMode === item.id ? null : item.id as ShieldMode)}
                        style={[
                            styles.card,
                            activeMode === item.id && styles.activeCard,
                            { borderColor: activeMode === item.id ? item.color : 'rgba(255,255,255,0.1)' }
                        ]}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: activeMode === item.id ? item.color : 'rgba(255,255,255,0.05)' }]}>
                            <item.icon size={24} color={activeMode === item.id ? '#fff' : '#64748b'} />
                        </View>
                        <Text style={[styles.label, activeMode === item.id && { color: '#fff' }]}>{item.label}</Text>

                        {/* Co-Presence Counter */}
                        <View style={styles.countContainer}>
                            <View style={[styles.dot, { backgroundColor: item.color }]} />
                            <Text style={styles.countText}>{counts[item.id] || 0}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    header: {
        color: '#94a3b8',
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: 24,
        marginBottom: 12,
        fontWeight: '600',
    },
    scroll: {
        paddingHorizontal: 20,
        gap: 12,
    },
    card: {
        width: 100,
        height: 110,
        backgroundColor: '#1e293b',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    activeCard: {
        backgroundColor: '#0f172a',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    label: {
        color: '#64748b',
        fontSize: 12,
        fontWeight: '500',
    },
    countContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
        backgroundColor: 'rgba(0,0,0,0.3)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 4,
    },
    countText: {
        color: '#94a3b8',
        fontSize: 10,
        fontWeight: 'bold',
    }
});
