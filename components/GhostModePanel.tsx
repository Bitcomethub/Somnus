import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ghost, Shield, Eye, EyeOff, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface Props {
    visible: boolean;
    onClose: () => void;
    isGhostMode: boolean;
    onToggleGhost: (enabled: boolean) => void;
}

export default function GhostModePanel({ visible, onClose, isGhostMode, onToggleGhost }: Props) {
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        opacity.value = withTiming(visible ? 1 : 0, { duration: 300 });
    }, [visible]);

    const handleToggle = (value: boolean) => {
        if (Platform.OS === 'ios') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onToggleGhost(value);
    };

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        pointerEvents: visible ? 'auto' : 'none' as any,
    }));

    if (!visible) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <BlurView intensity={90} tint="dark" style={styles.modal}>
                <View style={styles.header}>
                    <Ghost size={24} color={isGhostMode ? '#a855f7' : '#64748b'} />
                    <Text style={styles.title}>Ghost Modu</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                </View>

                <Text style={styles.description}>
                    Ghost modunda ses kalkanlarını kullanabilir ama eşleşmelere görünmez olursun. Sadece dinle, keşfedilme.
                </Text>

                <View style={styles.toggleRow}>
                    <View style={styles.toggleLabel}>
                        {isGhostMode ? <EyeOff size={20} color="#a855f7" /> : <Eye size={20} color="#64748b" />}
                        <Text style={[styles.toggleText, isGhostMode && { color: '#a855f7' }]}>
                            {isGhostMode ? 'Görünmezsin' : 'Görünürsün'}
                        </Text>
                    </View>
                    <Switch
                        value={isGhostMode}
                        onValueChange={handleToggle}
                        trackColor={{ false: '#3e3e3e', true: '#a855f7' }}
                        thumbColor={isGhostMode ? '#fff' : '#f4f3f4'}
                    />
                </View>

                <View style={styles.infoBox}>
                    <Shield size={16} color="#fbbf24" />
                    <Text style={styles.infoText}>
                        Ghost modundayken güvenliğin korunur. İstediğin zaman geri dönebilirsin.
                    </Text>
                </View>
            </BlurView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modal: {
        width: '85%',
        borderRadius: 24,
        padding: 24,
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '300',
        letterSpacing: 1,
        marginLeft: 12,
        flex: 1,
    },
    closeBtn: {
        padding: 4,
    },
    description: {
        color: '#94a3b8',
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 24,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 16,
        borderRadius: 16,
        marginBottom: 16,
    },
    toggleLabel: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggleText: {
        color: '#64748b',
        marginLeft: 12,
        fontWeight: '500',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(251,191,36,0.1)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(251,191,36,0.2)',
    },
    infoText: {
        color: '#fbbf24',
        fontSize: 12,
        marginLeft: 8,
        flex: 1,
        lineHeight: 18,
    },
});
