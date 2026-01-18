import { API_URL } from '@/constants/API';
import { BlurView } from 'expo-blur';
import { Music, Users, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import io from 'socket.io-client';

export default function JamRoom({ visible, onClose, userId }: { visible: boolean, onClose: () => void, userId: number }) {
    const [activeUsers, setActiveUsers] = useState<number[]>([]);
    const socket = useRef<any>(null);

    useEffect(() => {
        if (!visible) return;

        socket.current = io(API_URL);
        socket.current.emit('join_jam', { roomId: 'main-sanctuary', userId });

        socket.current.on('user_joined_jam', ({ userId: remoteUserId }: { userId: number }) => {
            setActiveUsers(prev => Array.from(new Set([...prev, remoteUserId])));
        });

        return () => {
            socket.current?.disconnect();
        };
    }, [visible]);

    const dropTrigger = (triggerId: string) => {
        socket.current?.emit('jam_trigger', {
            roomId: 'main-sanctuary',
            triggerId,
            userId,
            volume: 0.8
        });
        alert(`${triggerId} Jam'e gönderildi! 🚀`);
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <BlurView intensity={100} tint="dark" className="flex-1">
                <SafeAreaView className="flex-1">
                    <View className="flex-row justify-between items-center p-6">
                        <View>
                            <Text className="text-white text-2xl font-bold">Jam Sanctuary 🎙️</Text>
                            <View className="flex-row items-center mt-1">
                                <Users size={14} color="#a855f7" />
                                <Text className="text-purple-400 text-xs ml-1 font-bold">{activeUsers.length + 1} Kişi Yayında</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-white/10 p-2 rounded-full">
                            <X color="white" size={24} />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 items-center justify-center">
                        <View className="w-64 h-64 rounded-full border border-purple-500/20 items-center justify-center">
                            <View className="w-16 h-16 bg-tingle-primary rounded-full items-center justify-center shadow-2xl shadow-purple-500">
                                <Music color="white" size={24} />
                            </View>
                        </View>
                    </View>

                    <View className="p-8 bg-tingle-card/80 rounded-t-[40px] border-t border-white/10">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6">Senin Katmanların</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible mb-6">
                            {[
                                { id: 'wood-tap', name: 'Wood', emoji: '🪵' },
                                { id: 'silk-brush', name: 'Silk', emoji: '🧣' },
                                { id: 'whisper-affirm', name: 'Whisper', emoji: '🤫' }
                            ].map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    onPress={() => dropTrigger(t.id)}
                                    className="bg-tingle-primary/20 border border-tingle-primary/30 px-6 py-4 rounded-3xl items-center justify-center mr-4"
                                >
                                    <Text className="text-2xl mb-1">{t.emoji}</Text>
                                    <Text className="text-purple-400 text-[10px] font-bold uppercase">{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="items-center">
                            <Text className="text-gray-500 text-[10px] italic">Dokun ve odadaki herkesle aynı anda hisset.</Text>
                        </View>
                    </View>
                </SafeAreaView>
            </BlurView>
        </Modal>
    );
}
