import { API_URL } from '@/constants/API';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { ChevronRight, Sparkles } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SerenityOnboarding({ onFinish }: { onFinish: () => void }) {
    const [step, setStep] = useState(0);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<any[]>([
        { role: 'assistant', content: 'Hoş geldiniz... Ben Somnus Rehberiniz. Dünyanın gürültüsünü gümüş bir tepside kapının dışında bırakmaya hazır mısınız?' }
    ]);
    const [loading, setLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
        }).start();
    }, [step]);

    const handleChat = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/concierge/chat`, {
                message: userMsg,
                history: messages.slice(-4)
            });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // If conversation progresses, move steps
            if (messages.length > 2 && step < 2) {
                setStep(prev => prev + 1);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-black">
            {/* Background with Soft Glow */}
            <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?q=80&w=1974&auto=format&fit=crop' }}
                className="absolute inset-0 w-full h-full opacity-40"
                blurRadius={50}
            />

            <SafeAreaView className="flex-1">
                <Animated.View style={{ opacity: fadeAnim }} className="flex-1 px-8 justify-center">

                    <View className="items-center mb-12">
                        <View className="w-24 h-24 rounded-full bg-tingle-primary/20 items-center justify-center border border-tingle-primary/30">
                            <Sparkles color="#a855f7" size={48} />
                        </View>
                    </View>

                    <View className="mb-12">
                        {messages.filter(m => m.role === 'assistant').slice(-1).map((msg, idx) => (
                            <Text key={idx} className="text-white text-2xl font-light leading-relaxed text-center italic">
                                "{msg.content}"
                            </Text>
                        ))}
                    </View>

                    {step < 3 ? (
                        <BlurView intensity={20} tint="dark" className="rounded-3xl p-4 border border-white/10 flex-row items-center">
                            <TextInput
                                value={input}
                                onChangeText={setInput}
                                placeholder="Hislerini buraya bırak..."
                                placeholderTextColor="#64748b"
                                className="flex-1 text-white p-2 text-lg font-light"
                                onSubmitEditing={handleChat}
                            />
                            <TouchableOpacity
                                onPress={handleChat}
                                disabled={loading}
                                className="bg-tingle-primary w-12 h-12 rounded-full items-center justify-center"
                            >
                                {loading ? <ActivityIndicator color="white" /> : <ChevronRight color="white" size={24} />}
                            </TouchableOpacity>
                        </BlurView>
                    ) : (
                        <TouchableOpacity
                            onFinish={onFinish}
                            className="bg-tingle-primary py-5 rounded-full items-center border border-white/20"
                        >
                            <Text className="text-white font-bold text-lg">Sığınağa Gir</Text>
                        </TouchableOpacity>
                    )}

                    <View className="mt-12 flex-row justify-center space-x-3">
                        {[0, 1, 2, 3].map(i => (
                            <View key={i} className={`w-1.5 h-1.5 rounded-full ${step === i ? 'bg-purple-500 w-4' : 'bg-white/20'}`} />
                        ))}
                    </View>

                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

import { SafeAreaView } from 'react-native-safe-area-context';
