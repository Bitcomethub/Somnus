import { API_URL } from '@/constants/API';
import axios from 'axios';
import * as Haptics from 'expo-haptics';
import { Heart, Music, Sparkles, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

export const GIFTS = [
    { id: 'SOFT_WHISPER', name: 'Whisper', emoji: '🤫', cost: 10, icon: Music, color: '#8B5CF6' },
    { id: 'HAPTIC_PULSE', name: 'Pulse', emoji: '🫀', cost: 25, icon: Heart, color: '#EC4899' },
    { id: 'AMBIENCE_SHIFT', name: 'Magic', emoji: '✨', cost: 50, icon: Sparkles, color: '#F59E0B' },
    { id: 'TRIGGER_REQUEST', name: 'Request', emoji: '📝', cost: 100, icon: Zap, color: '#EF4444' },
];

export default function GiftingPalette({ senderId, receiverId, onSent, socket }: { senderId: number, receiverId: number, onSent?: () => void, socket?: any }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const sendGift = async (gift: typeof GIFTS[0]) => {
        setLoadingId(gift.id);
        try {
            const res = await axios.post(`${API_URL}/creator/tip`, {
                senderId,
                receiverId,
                amount: gift.cost,
                giftType: gift.id
            });

            if (res.data.success) {
                // Trigger local feedback
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Emit socket event for real-time room effect
                if (socket) {
                    socket.emit('jam_gift', {
                        roomId: 'main-sanctuary', // Mock room
                        senderId,
                        receiverId,
                        giftType: gift.id,
                        amount: gift.cost
                    });
                }

                alert(`${gift.name} gönderildi! 🎁`);
                if (onSent) onSent();
            }
        } catch (e: any) {
            alert(e.response?.data?.error || "Hediye gönderilemedi.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <View className="bg-tingle-card/95 p-6 rounded-t-[40px] border-t border-white/10">
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 text-center">Hediye Gönder</Text>

            <View className="flex-row justify-between mb-4">
                {GIFTS.map((gift) => (
                    <TouchableOpacity
                        key={gift.id}
                        onPress={() => sendGift(gift)}
                        disabled={!!loadingId}
                        className="items-center w-[22%]"
                    >
                        <View
                            style={{ backgroundColor: `${gift.color}20`, borderColor: `${gift.color}40` }}
                            className="w-16 h-16 rounded-2xl border items-center justify-center mb-2"
                        >
                            {loadingId === gift.id ? (
                                <ActivityIndicator color={gift.color} />
                            ) : (
                                <gift.icon color={gift.color} size={28} />
                            )}
                        </View>
                        <Text className="text-white text-[10px] font-bold uppercase">{gift.name}</Text>
                        <View className="flex-row items-center mt-1">
                            <Text className="text-gray-500 text-[10px] font-bold">{gift.cost}</Text>
                            <Text className="text-purple-400 text-[10px] font-bold ml-0.5">TT</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-gray-500 text-[9px] text-center italic mt-4">
                Hediyeler yaratıcıya %90 oranında ulaştırılır. 💜
            </Text>
        </View>
    );
}
