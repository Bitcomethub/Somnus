import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Play } from 'lucide-react-native';

const allSounds = [
  { id: 1, title: 'Midnight Rain', user: 'Elara', duration: '10s' },
  { id: 2, title: 'Page Turning', user: 'BookLvr', duration: '15s' },
  { id: 3, title: 'Cat Purr', user: 'Suki', duration: '30s' },
  { id: 4, title: 'Keyboard Typing', user: 'DevGuy', duration: '20s' },
  { id: 5, title: 'Wood Carving', user: 'Artisan', duration: '12s' },
  { id: 6, title: 'Ocean Waves', user: 'Blue', duration: '45s' },
  { id: 7, title: 'Crackling Fire', user: 'Cozy', duration: '60s' },
  { id: 8, title: 'Hair Brushing', user: 'Salon', duration: '25s' },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView className="flex-1 bg-tingle-bg">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <Text className="text-2xl font-light text-white mb-6">Sound Wall</Text>
        <Text className="text-gray-400 text-sm mb-6">Discover micro-ASMR moments shared by the community.</Text>

        <View className="flex-row flex-wrap justify-between">
          {allSounds.map((item) => (
            <View key={item.id} className="w-[48%] bg-tingle-card p-4 rounded-2xl mb-4 shadow-lg shadow-black/30">
              <View className="flex-row justify-between items-start mb-4">
                <View className="bg-tingle-accent p-3 rounded-full">
                  <Mic size={18} color="#a855f7" />
                </View>
                <Text className="text-gray-500 text-xs">{item.duration}</Text>
              </View>
              <Text className="text-white font-medium mb-1 text-lg">{item.title}</Text>
              <Text className="text-gray-500 text-xs mb-3">@{item.user}</Text>
              <View className="flex-row items-center space-x-2">
                <Play size={12} color="#a855f7" />
                <Text className="text-tingle-primary text-xs">Play</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
