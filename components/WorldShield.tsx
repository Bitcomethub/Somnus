import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Wind, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const SHIELD_PRESETS = [
    { id: 'office', name: 'Ofis Kalkanı', desc: 'İş arkadaşları & klavye tıkırtısı', colors: ['#1e293b', '#0f172a'] },
    { id: 'traffic', name: 'Trafik Kalkanı', desc: 'Uğultu & korna bastırma', colors: ['#450a0a', '#000000'] },
    { id: 'white', name: 'Saf Beyaz Gürültü', desc: 'Tam izolasyon', colors: ['#1e1b4b', '#000000'] },
];

export default function WorldShield({ isActive, onToggle }: { isActive: boolean, onToggle: (id: string | null) => void }) {
    const [selected, setSelected] = useState<string | null>(null);

    if (!isActive) return null;

    return (
        <View className="absolute inset-0 z-[100]">
            <LinearGradient
                colors={SHIELD_PRESETS.find(p => p.id === selected)?.colors || ['#000', '#000']}
                className="flex-1 items-center justify-center p-8"
            >
                <View className="items-center mb-12">
                    <View className="bg-white/10 p-8 rounded-full border border-white/20 mb-6">
                        <Shield color={selected ? "#a855f7" : "#64748b"} size={80} />
                    </View>
                    <Text className="text-white text-3xl font-bold text-center">Dünya Kalkanı Active 🛡️</Text>
                    <Text className="text-gray-400 text-center mt-2 px-4">Ofis gürültüsü veya dış dünyanın kaosu artık sana ulaşamaz.</Text>
                </View>

                <View className="w-full space-y-4">
                    {SHIELD_PRESETS.map((preset) => (
                        <TouchableOpacity
                            key={preset.id}
                            onPress={() => setSelected(preset.id === selected ? null : preset.id)}
                            className={`p-6 rounded-[32px] border flex-row items-center ${selected === preset.id ? 'bg-white/20 border-purple-500' : 'bg-white/5 border-white/10'}`}
                        >
                            <View className={`p-4 rounded-2xl mr-4 ${selected === preset.id ? 'bg-purple-500' : 'bg-white/10'}`}>
                                {preset.id === 'office' ? <Wind color="white" size={24} /> : <Zap color="white" size={24} />}
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-lg">{preset.name}</Text>
                                <Text className="text-gray-500 text-xs">{preset.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={() => onToggle(null)}
                    className="mt-12 bg-white/10 px-12 py-4 rounded-full border border-white/20"
                >
                    <Text className="text-white font-bold text-lg">Kalkanı Devre Dışı Bırak</Text>
                </TouchableOpacity>
            </LinearGradient>
        </View>
    );
}
