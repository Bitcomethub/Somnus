import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mic, Play, Pause, Volume2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

// ASMR sounds with online URLs - all loop seamlessly
const ASMR_SOUNDS = [
  { id: 1, title: 'Gece Yağmuru', user: 'Elara', icon: '🌧️', url: 'https://www.soundjay.com/nature/sounds/rain-01.mp3' },
  { id: 2, title: 'Sayfa Çevirme', user: 'BookLvr', icon: '📖', url: 'https://www.soundjay.com/misc/sounds/page-flip-01.mp3' },
  { id: 3, title: 'Kedi Mırıltısı', user: 'Suki', icon: '🐱', url: 'https://www.soundjay.com/animals/sounds/cat-purr-1.mp3' },
  { id: 4, title: 'Klavye Sesi', user: 'DevGuy', icon: '⌨️', url: 'https://www.soundjay.com/human/sounds/keyboard-typing-2.mp3' },
  { id: 5, title: 'Odun Ateşi', user: 'Cozy', icon: '🔥', url: 'https://www.soundjay.com/nature/sounds/fire-burning-1.mp3' },
  { id: 6, title: 'Okyanus Dalgaları', user: 'Blue', icon: '🌊', url: 'https://www.soundjay.com/nature/sounds/ocean-wave-1.mp3' },
  { id: 7, title: 'Rüzgar Sesi', user: 'Sky', icon: '💨', url: 'https://www.soundjay.com/nature/sounds/wind-howl-1.mp3' },
  { id: 8, title: 'Kuş Cıvıltısı', user: 'Forest', icon: '🐦', url: 'https://www.soundjay.com/animals/sounds/bird-1.mp3' },
  { id: 9, title: 'Tren Rayları', user: 'Nomad', icon: '🚂', url: 'https://www.soundjay.com/transportation/sounds/train-1.mp3' },
  { id: 10, title: 'Fısıltı', user: 'ASMR', icon: '🤫', url: 'https://www.soundjay.com/human/sounds/breathing-1.mp3' },
];

export default function ExploreScreen() {
  const [playingId, setPlayingId] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const handlePlay = async (item: typeof ASMR_SOUNDS[0]) => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // If same sound is playing, stop it
    if (playingId === item.id) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setPlayingId(null);
      return;
    }

    // Stop any currently playing sound
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
    }

    // Play new sound with loop
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: item.url },
        { shouldPlay: true, isLooping: true, volume: 0.8 }
      );
      soundRef.current = sound;
      setPlayingId(item.id);
    } catch (e) {
      console.log('Audio playback error:', e);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-tingle-bg">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="flex-row items-center mb-4">
          <Volume2 size={24} color="#a855f7" />
          <Text className="text-2xl font-light text-white ml-3">Ses Duvarı</Text>
        </View>
        <Text className="text-gray-500 text-sm mb-6">
          Topluluktan ASMR anları. Dokun ve loop olarak dinle.
        </Text>

        {/* Sound Grid */}
        <View className="flex-row flex-wrap justify-between">
          {ASMR_SOUNDS.map((item) => {
            const isPlaying = playingId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => handlePlay(item)}
                className={`w-[48%] p-4 rounded-2xl mb-4 border ${isPlaying
                    ? 'bg-purple-900/40 border-purple-500/50'
                    : 'bg-tingle-card border-white/5'
                  }`}
                activeOpacity={0.7}
              >
                {/* Icon & Play State */}
                <View className="flex-row justify-between items-start mb-3">
                  <View className={`p-3 rounded-full ${isPlaying ? 'bg-purple-600' : 'bg-tingle-accent'}`}>
                    <Text className="text-xl">{item.icon}</Text>
                  </View>
                  {isPlaying ? (
                    <Pause size={16} color="#a855f7" />
                  ) : (
                    <Play size={16} color="#64748b" />
                  )}
                </View>

                {/* Title & User */}
                <Text className={`font-medium mb-1 ${isPlaying ? 'text-white' : 'text-gray-300'}`}>
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-xs">@{item.user}</Text>

                {/* Loop indicator when playing */}
                {isPlaying && (
                  <View className="mt-2 flex-row items-center">
                    <View className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                    <Text className="text-green-400 text-xs">Çalıyor (Loop)</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
