import { Shield } from 'lucide-react-native';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

const TRIGGERS = [
    { id: 'tapping', name: 'Tapping', emoji: '🖐️' },
    { id: 'whisper', name: 'Whispering', emoji: '🤫' },
    { id: 'page-turning', name: 'Page Turning', emoji: '📖' },
    { id: 'crinkle', name: 'Crinkling', emoji: '🍿' },
    { id: 'liquid', name: 'Liquid', emoji: '💧' },
    { id: 'brush', name: 'Soft Brush', emoji: '🖌️' }
];

export default function SensoryProfiler({ onSave }: { onSave: (profile: any) => void }) {
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
    const [tolerance, setTolerance] = useState(5);

    const toggleTrigger = (id: string) => {
        setSelectedTriggers(prev =>
            prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
        );
    };

    return (
        <View className="bg-tingle-card p-6 rounded-3xl border border-white/10 shadow-2xl">
            <View className="flex-row items-center mb-6">
                <Shield color="#a855f7" size={24} />
                <Text className="text-white text-xl font-bold ml-3">Duyusal Profilin</Text>
            </View>

            <Text className="text-gray-400 text-sm mb-4 uppercase tracking-widest font-medium">Favori Tetikleyicilerin</Text>
            <View className="flex-row flex-wrap justify-between mb-8">
                {TRIGGERS.map(t => (
                    <TouchableOpacity
                        key={t.id}
                        onPress={() => toggleTrigger(t.id)}
                        className={`w-[48%] p-4 rounded-2xl mb-3 border-2 flex-row items-center ${selectedTriggers.includes(t.id) ? 'bg-tingle-primary/20 border-tingle-primary' : 'bg-white/5 border-transparent'
                            }`}
                    >
                        <Text className="text-xl mr-2">{t.emoji}</Text>
                        <Text className={`text-sm ${selectedTriggers.includes(t.id) ? 'text-white font-bold' : 'text-gray-500'}`}>{t.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="mb-8">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-gray-400 text-sm uppercase tracking-widest font-medium">Hassasiyet Seviyesi</Text>
                    <Text className="text-tingle-primary font-bold">{tolerance}/10</Text>
                </View>
                <View className="h-2 bg-white/5 rounded-full overflow-hidden flex-row">
                    {[...Array(10)].map((_, i) => (
                        <TouchableOpacity
                            key={i}
                            onPress={() => setTolerance(i + 1)}
                            className={`flex-1 h-full ${i < tolerance ? 'bg-tingle-primary' : 'bg-transparent'}`}
                            style={{ borderRightWidth: i < 9 ? 1 : 0, borderRightColor: 'rgba(0,0,0,0.2)' }}
                        />
                    ))}
                </View>
                <View className="flex-row justify-between mt-2">
                    <Text className="text-gray-600 text-[10px]">Fısıltı</Text>
                    <Text className="text-gray-600 text-[10px]">Fırtına</Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => onSave({ selectedTriggers, tolerance })}
                className="bg-tingle-primary py-4 rounded-xl items-center shadow-lg shadow-purple-500/30"
            >
                <Text className="text-white font-bold text-lg">Kaydet ve Senkronize Et</Text>
            </TouchableOpacity>
        </View>
    );
}
