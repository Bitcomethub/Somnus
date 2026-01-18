import { API_URL } from '@/constants/API';
import axios from 'axios';
import { Play, Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ExploreGallery() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await axios.get(`${API_URL}/niche-gallery`);
                setCategories(res.data);
            } catch (e) {
                console.error("Gallery fetch failed", e);
            }
        };
        fetchGallery();
    }, []);

    return (
        <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-bold">Keşfet 🌌</Text>
                <TouchableOpacity className="bg-tingle-primary/20 px-3 py-1 rounded-full border border-tingle-primary/30">
                    <Text className="text-tingle-primary text-[10px] font-bold uppercase">Tümünü Gör</Text>
                </TouchableOpacity>
            </View>

            {categories.map((cat, idx) => (
                <View key={idx} className="mb-6">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">{cat.category}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                        {cat.items.map((item: any) => (
                            <TouchableOpacity
                                key={item.id}
                                className="mr-4 bg-tingle-card w-48 rounded-3xl overflow-hidden border border-white/5 shadow-lg"
                                onPress={() => alert(`${item.name} yükleniyor...`)}
                            >
                                <View className="h-32 bg-tingle-bg items-center justify-center relative">
                                    {/* Textural Representation placeholder */}
                                    <View className="w-16 h-16 rounded-full bg-tingle-primary/10 items-center justify-center">
                                        <Sparkles color="#a855f7" size={32} />
                                    </View>
                                    <View className="absolute bottom-3 right-3 bg-tingle-primary p-2 rounded-full">
                                        <Play color="white" size={12} fill="white" />
                                    </View>
                                </View>
                                <View className="p-4">
                                    <Text className="text-white font-bold mb-1">{item.name}</Text>
                                    <View className="flex-row flex-wrap">
                                        {item.tags.map((tag: string) => (
                                            <View key={tag} className="bg-white/5 px-2 py-0.5 rounded-md mr-1 mt-1">
                                                <Text className="text-gray-500 text-[8px] uppercase">{tag}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            ))}
        </View>
    );
}
