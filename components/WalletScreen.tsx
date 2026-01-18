import { API_URL } from '@/constants/API';
import axios from 'axios';
import { BlurView } from 'expo-blur';
import { ChevronLeft, History, Sparkles, Zap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function WalletScreen({ userId, onClose }: { userId: number, onClose: () => void }) {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await axios.get(`${API_URL}/wallet/balance/${userId}`);
                setBalance(res.data.balance);
            } catch (e) {
                console.error("Balance fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        fetchBalance();
    }, [userId]);

    const buyTokens = async (amount: number) => {
        setProcessing(true);
        try {
            const res = await axios.post(`${API_URL}/wallet/buy`, { userId, amount });
            if (res.data.success) {
                setBalance(res.data.newBalance);
                alert(`${amount} Tingle Token başarıyla eklendi! ✨`);
            }
        } catch (e) {
            alert("Satın alma başarısız.");
        } finally {
            setProcessing(false);
        }
    };

    const PACKAGES = [
        { amount: 100, price: '₺34.99', popular: false },
        { amount: 500, price: '₺149.99', popular: true },
        { amount: 1200, price: '₺299.99', popular: false },
    ];

    return (
        <SafeAreaView className="flex-1 bg-tingle-bg">
            <View className="flex-row items-center p-6">
                <TouchableOpacity onPress={onClose} className="bg-white/5 p-2 rounded-full">
                    <ChevronLeft color="white" size={24} />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold ml-4">Cüzdanım</Text>
            </View>

            <ScrollView className="flex-1 px-6">
                {/* Balance Card */}
                <BlurView intensity={80} tint="dark" className="rounded-[40px] p-8 border border-white/10 items-center overflow-hidden mb-8">
                    <View className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles color="white" size={120} />
                    </View>
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Mevcut Bakiyen</Text>
                    {loading ? (
                        <ActivityIndicator color="#a855f7" />
                    ) : (
                        <View className="flex-row items-center">
                            <Text className="text-white text-5xl font-bold">{balance}</Text>
                            <Text className="text-purple-400 text-lg font-bold ml-2">TT</Text>
                        </View>
                    )}
                </BlurView>

                <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-6 px-2">Token Paketleri</Text>

                {PACKAGES.map((pkg, idx) => (
                    <TouchableOpacity
                        key={idx}
                        disabled={processing}
                        onPress={() => buyTokens(pkg.amount)}
                        className={`mb-4 rounded-3xl p-6 flex-row justify-between items-center border ${pkg.popular ? 'bg-tingle-primary/20 border-tingle-primary' : 'bg-tingle-card border-white/5'}`}
                    >
                        <View className="flex-row items-center">
                            <View className="bg-tingle-primary/10 p-3 rounded-2xl mr-4">
                                <Zap color="#a855f7" size={24} fill={pkg.popular ? "#a855f7" : "transparent"} />
                            </View>
                            <View>
                                <Text className="text-white font-bold text-lg">{pkg.amount} TT</Text>
                                {pkg.popular && <Text className="text-tingle-primary text-[10px] font-bold uppercase">En Popüler</Text>}
                            </View>
                        </View>
                        <View className="bg-white/5 px-4 py-2 rounded-xl">
                            <Text className="text-white font-bold">{pkg.price}</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                <View className="mt-8 bg-tingle-card/40 p-6 rounded-3xl border border-white/5 flex-row items-center">
                    <History color="#64748b" size={20} />
                    <Text className="text-gray-500 ml-3 text-sm">İşlem geçmişini görüntüle</Text>
                </View>

            </ScrollView>

            {processing && (
                <BlurView intensity={20} className="absolute inset-0 items-center justify-center">
                    <ActivityIndicator color="#a855f7" size="large" />
                </BlurView>
            )}
        </SafeAreaView>
    );
}
