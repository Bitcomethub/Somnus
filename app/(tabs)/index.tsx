import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Modal, TextInput, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Wind, CloudRain, Zap, Mic, Heart, Headphones, Moon, Sparkles } from 'lucide-react-native';
import axios from 'axios';
import { Audio } from 'expo-av';
import io from 'socket.io-client';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { API_URL } from '@/constants/API';
import DataConstants from '@/constants/Data'; // Assuming this exists or using inline
import WhisperRecorder from '@/components/WhisperRecorder';
import VisualCalibrator from '@/components/VisualCalibrator';
import SleepSyncScreen from '@/components/SleepSyncScreen';
import ShieldSelector, { ShieldMode } from '@/components/ShieldSelector';
import SplashScreen from '@/components/SplashScreen';
import BreathingLight from '@/components/BreathingLight';
import MicroSurvey from '@/components/MicroSurvey';
import FrostedGlassReveal from '@/components/FrostedGlassReveal';
import VideoBackground from '@/components/VideoBackground';
import SleepTimer from '@/components/SleepTimer';
import GhostModePanel from '@/components/GhostModePanel';
import PremiumLogo from '@/components/PremiumLogo';

// --- Constants ---
const SHIELD_SOUNDS: Record<string, any> = {
  'commuter': require('../../assets/sounds/shield_commuter.mp3'),
  'office': require('../../assets/sounds/shield_office.mp3'),
  'nomad': require('../../assets/sounds/shield_nomad.mp3'),
  'sky': require('../../assets/sounds/shield_sky.mp3'),
};

const SHIELD_VIDEOS: Record<string, any> = {
  'commuter': { uri: 'https://static.videezy.com/system/resources/previews/000/005/016/original/Subway_Train_Passing_Platform.mp4' },
  'office': { uri: 'https://static.videezy.com/system/resources/previews/000/008/296/original/View_of_busy_office.mp4' },
  'nomad': { uri: 'https://static.videezy.com/system/resources/previews/000/004/937/original/Foggy_Pine_Wood_Forest.mp4' },
  'sky': { uri: 'https://static.videezy.com/system/resources/previews/000/005/527/original/Clouds_Time_Lapse_1080p.mp4' },
};

const RECOMMENDED_VIBES = ["Tired from work", "Need focus", "Anxious", "Just waking up"];

const soundWallItems = [
  { id: 1, title: 'Midnight Rain', user: 'Elara', duration: '10s' },
  { id: 2, title: 'Page Turning', user: 'BookLvr', duration: '15s' },
];

export default function HomeScreen() {
  // --- State ---
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showSleepMode, setShowSleepMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [emberBalance] = useState(42);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [revealedProfiles, setRevealedProfiles] = useState<Set<number>>(new Set());

  // Shield & Audio State
  const [activeShield, setActiveShield] = useState<ShieldMode>(null);
  const [shieldCounts, setShieldCounts] = useState<Record<string, number>>({});
  const shieldSocket = useRef<any>(null);
  const shieldSound = useRef<Audio.Sound | null>(null);

  // AI & Vibe State
  const [vibeText, setVibeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMicroSurvey, setShowMicroSurvey] = useState(false);

  // Final Touch: Sleep Timer & Ghost Mode
  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showGhostPanel, setShowGhostPanel] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);

  // --- Pulse Animation ---
  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }]
  }));

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );
  }, []);

  // --- Handlers ---
  const handleShieldSelect = async (mode: ShieldMode) => {
    setActiveShield(mode);
    setVibeText(""); // Clear vibe text on manual select

    // 1. Socket Join
    if (shieldSocket.current && mode) {
      shieldSocket.current.emit('join_shield_room', mode);
    }

    // 2. Audio Cross-Fade Logic
    const oldSound = shieldSound.current;

    // Start new sound first (for cross-fade effect)
    if (mode && SHIELD_SOUNDS[mode]) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(
          SHIELD_SOUNDS[mode],
          { shouldPlay: true, isLooping: true, volume: 0 } // Start silent
        );
        shieldSound.current = newSound;

        // Fade-in new sound over 1.5 seconds
        const fadeIn = async () => {
          for (let vol = 0; vol <= 0.8; vol += 0.1) {
            await newSound.setVolumeAsync(vol);
            await new Promise(r => setTimeout(r, 150));
          }
        };
        fadeIn();
      } catch (e) { console.log('Shield Audio Error', e); }
    } else {
      shieldSound.current = null;
    }

    // Fade-out old sound over 1 second
    if (oldSound) {
      const fadeOut = async () => {
        try {
          const status = await oldSound.getStatusAsync();
          if (status.isLoaded) {
            let vol = status.volume || 0.8;
            while (vol > 0) {
              vol = Math.max(0, vol - 0.1);
              await oldSound.setVolumeAsync(vol);
              await new Promise(r => setTimeout(r, 100));
            }
            await oldSound.unloadAsync();
          }
        } catch (e) { /* Sound already unloaded */ }
      };
      fadeOut();
    }
  };

  const sendHeartbeat = () => {
    if (activeShield && shieldSocket.current) {
      shieldSocket.current.emit('shield_heartbeat', { shieldMode: activeShield });
      alert("Silent High-Five sent! 👋");
    }
  };

  const handleVibeCheck = async (text: string) => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setVibeText(text);
    try {
      const res = await axios.post(`${API_URL}/vibe-check`, { statusText: text });
      const { mode, vibe } = res.data;

      if (mode) handleShieldSelect(mode as ShieldMode);
      alert(`Somnus AI: Switching to ${mode} mode for "${vibe}" vibes.`);
    } catch (e) {
      handleShieldSelect('nomad'); // Fallback
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReveal = async (profileId: number) => {
    try {
      const res = await axios.post(`${API_URL}/reveal-user`, { userId: profileId });
      if (res.data.avatarUrl) {
        setProfiles(prev => prev.map(p =>
          p.id === profileId ? { ...p, avatarUrl: res.data.avatarUrl } : p
        ));
        setRevealedProfiles(prev => new Set(prev).add(profileId));
        setShowRecorder(true);
      }
    } catch (e) {
      console.log("Reveal failed", e);
    }
  };

  // --- Effects ---

  // 1. Initialize Socket & Cleanup
  useEffect(() => {
    shieldSocket.current = io(API_URL);

    shieldSocket.current.on('shield_count', (data: { mode: string, count: number }) => {
      setShieldCounts(prev => ({ ...prev, [data.mode]: data.count }));
    });

    return () => {
      shieldSocket.current?.disconnect();
      if (shieldSound.current) shieldSound.current.unloadAsync();
    };
  }, []);

  // 2. Zero-Look & Deep Link Handler (Simulated)
  useEffect(() => {
    // Auto-Play (Zero-Look Entry)
    const init = async () => {
      // Ideally check AsyncStorage for last preference
      // handleShieldSelect('commuter'); // Optional: Auto-start
    };
    init();

    // Deep Link Check
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url || "";
      if (url.includes('play/shield')) {
        const parts = url.split('/');
        const mode = parts[parts.length - 1] as ShieldMode;
        if (SHIELD_SOUNDS[mode]) {
          handleShieldSelect(mode);
          alert(`Siri/Widget launched: ${mode}`);
        }
      }
    };
    // Linking.addEventListener('url', handleDeepLink); // Add in real build

    // Passive Survey Timer
    const timer = setTimeout(() => setShowMicroSurvey(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  // 3. Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/users`);
        if (res.data && res.data.length > 0) {
          setProfiles(res.data);
        } else {
          throw new Error("No data");
        }
      } catch (e) {
        // Fallback Mock Data
        setProfiles([
          { id: 1, username: 'Elara', favTrigger: 'Rain', avatarUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
          { id: 2, username: 'Kael', favTrigger: 'Wind', avatarUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
        ]);
      }
    };
    fetchUsers();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-tingle-bg">
      <StatusBar barStyle="light-content" />

      {/* Background Layer */}
      <VideoBackground
        source={activeShield ? SHIELD_VIDEOS[activeShield] : null}
        isActive={!!activeShield}
        mode={activeShield || 'default'}
      />
      <BreathingLight isActive={!!activeShield} mode={activeShield || 'default'} bpm={12} />

      {/* Overlays */}
      <SleepSyncScreen visible={showSleepMode} onClose={() => setShowSleepMode(false)} />
      <VisualCalibrator />

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header with Premium Logo */}
        <View className="pt-4 pb-2">
          {/* Top Row: Utility Buttons */}
          <View className="flex-row justify-between items-center px-4 mb-4">
            {/* Left: Sleep Mode */}
            <TouchableOpacity onPress={() => setShowSleepMode(true)} className="bg-tingle-card/50 p-2.5 rounded-full">
              <Moon color="#8B5CF6" size={22} />
            </TouchableOpacity>

            {/* Right: Controls */}
            <View className="flex-row items-center space-x-2">
              {/* Ghost Mode Indicator */}
              {isGhostMode && (
                <View className="bg-purple-900/50 px-2 py-1 rounded-full">
                  <Text className="text-purple-400 text-xs">👻</Text>
                </View>
              )}

              {/* Ember Balance */}
              <View className="bg-tingle-card/50 px-3 py-1.5 rounded-full flex-row items-center border border-orange-500/20">
                <Text className="text-orange-400 font-bold text-xs">🔥 {emberBalance}</Text>
              </View>

              {/* Sleep Timer Button */}
              <TouchableOpacity onPress={() => setShowSleepTimer(true)} className="bg-tingle-card/50 p-2.5 rounded-full">
                <Moon color="#fbbf24" size={18} />
              </TouchableOpacity>

              {/* Ghost Mode Button */}
              <TouchableOpacity onPress={() => setShowGhostPanel(true)} className="bg-tingle-card/50 p-2.5 rounded-full">
                <Headphones color={isGhostMode ? "#a855f7" : "#64748b"} size={22} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Centered Premium Logo */}
          <PremiumLogo mode={activeShield || 'default'} />
        </View>

        {/* AI Vibe Input */}
        <View className="mx-6 mb-8">
          <Text className="text-gray-400 text-xs mb-2 uppercase tracking-widest pl-1">Vibe Engine (AI)</Text>
          <View className="flex-row items-center bg-tingle-card rounded-xl p-2 border border-white/10">
            <TextInput
              placeholder="How are you feeling?"
              placeholderTextColor="#64748b"
              className="flex-1 text-white p-2"
              value={vibeText}
              onChangeText={setVibeText}
              onSubmitEditing={() => handleVibeCheck(vibeText)}
            />
            <TouchableOpacity
              onPress={() => handleVibeCheck(vibeText)}
              disabled={isAnalyzing}
              className="bg-tingle-primary p-2 rounded-lg"
            >
              {isAnalyzing ? <ActivityIndicator color="white" size="small" /> : <Zap size={18} color="white" />}
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
            {RECOMMENDED_VIBES.map((v, i) => (
              <TouchableOpacity key={i} onPress={() => handleVibeCheck(v)} className="mr-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                <Text className="text-gray-400 text-xs">{v}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sensory Shield Selector */}
        <ShieldSelector
          activeMode={activeShield}
          onSelect={handleShieldSelect}
          counts={shieldCounts}
        />

        {/* Silent High Five Button */}
        {activeShield && (
          <TouchableOpacity
            onPress={sendHeartbeat}
            className="mx-6 mb-6 bg-tingle-primary p-4 rounded-xl flex-row justify-center items-center"
          >
            <Heart size={20} color="white" fill="white" />
            <Text className="text-white font-bold ml-2">I&apos;m Here ({shieldCounts[activeShield] || 1})</Text>
          </TouchableOpacity>
        )}

        {/* Tingle-mates Section */}
        <Text className="text-gray-400 text-sm mb-4 tracking-wider uppercase font-medium px-6">Senin Sesdaşların</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 pl-6 overflow-visible">
          {profiles.map((profile) => (
            <Animated.View key={profile.id} style={[pulseStyle]} className="mr-5">
              <TouchableOpacity
                className="items-center"
                onPress={() => setSelectedProfile(profile)}
                onLongPress={() => handleReveal(profile.id)}
              >
                <View className="relative">
                  <Image
                    source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/150' }}
                    className="w-20 h-20 rounded-full border-2 border-tingle-primary mb-2"
                    blurRadius={revealedProfiles.has(profile.id) ? 0 : 10}
                  />
                  {!revealedProfiles.has(profile.id) && (
                    <View className="absolute inset-0 items-center justify-center z-10">
                      <Mic color="rgba(255,255,255,0.7)" size={24} />
                    </View>
                  )}
                  <View className="absolute bottom-0 right-0 bg-tingle-bg rounded-full p-1 border border-tingle-card">
                    <CloudRain size={12} color="#a855f7" />
                  </View>
                </View>
                <Text className="text-white text-xs font-medium">{profile.username}</Text>
                <Text className="text-gray-500 text-[10px]">{profile.favTrigger}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>

        {/* Featured Vibe */}
        <View className="mb-8 px-6">
          <Text className="text-gray-400 text-sm mb-4 tracking-wider uppercase font-medium">Günün Vibe&apos;ı</Text>
          <View className="bg-tingle-card rounded-3xl p-6 shadow-xl shadow-black/50">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center space-x-2">
                <CloudRain color="#a855f7" size={20} />
                <Text className="text-white font-medium text-lg ml-2">Neon Yağmuru</Text>
              </View>
              <View className="bg-tingle-accent px-3 py-1 rounded-full">
                <Text className="text-tingle-primary text-xs">Canlı</Text>
              </View>
            </View>
            <Text className="text-gray-400 text-sm mb-4 leading-relaxed">
              Tokyo sokaklarında gece yarısı yürüyüşü. Şemsiyeye düşen damlalar ve uzaktan gelen trafik sesi.
            </Text>
            <TouchableOpacity className="bg-tingle-primary w-full py-3 rounded-xl items-center">
              <Text className="text-white font-bold tracking-wide">Dinle</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Sound Wall (Keşfet) */}
        <View className="px-6">
          <Text className="text-gray-400 text-sm mb-4 tracking-wider uppercase font-medium">Sound Wall</Text>
          <View className="flex-row flex-wrap justify-between">
            {soundWallItems.map((item) => (
              <View key={item.id} className="w-[48%] bg-tingle-card p-4 rounded-2xl mb-4">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="bg-tingle-accent p-2 rounded-full">
                    <Mic size={16} color="#ffffff" />
                  </View>
                  <Text className="text-gray-500 text-xs">{item.duration}</Text>
                </View>
                <Text className="text-white font-medium mb-1">{item.title}</Text>
                <Text className="text-gray-500 text-xs">@{item.user}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Passive Micro Survey */}
      <MicroSurvey
        visible={showMicroSurvey}
        question="Bu yağmur sesi seni çocukluğuna mı götürüyor? 🍼"
        onAnswer={(ans) => {
          setShowMicroSurvey(false);
          alert(`Somnus AI: Not edildi (${ans}). Frekansına uygun birini bulduğumda haber vereceğim. ✨`);
        }}
        onDismiss={() => setShowMicroSurvey(false)}
      />

      {/* Sleep Timer */}
      <SleepTimer
        visible={showSleepTimer}
        onClose={() => setShowSleepTimer(false)}
        onSleepStart={(durationMs) => console.log('Sleep started:', durationMs)}
        currentSound={shieldSound.current}
      />

      {/* Ghost Mode Panel */}
      <GhostModePanel
        visible={showGhostPanel}
        onClose={() => setShowGhostPanel(false)}
        isGhostMode={isGhostMode}
        onToggleGhost={setIsGhostMode}
      />

      {/* Profile Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!selectedProfile}
        onRequestClose={() => setSelectedProfile(null)}
      >
        <BlurView intensity={90} tint="dark" className="flex-1 justify-center items-center p-6">
          {selectedProfile && (
            <View className="bg-tingle-card w-full rounded-3xl p-8 items-center shadow-2xl relative">
              <TouchableOpacity
                className="absolute top-4 right-4 bg-tingle-accent p-2 rounded-full"
                onPress={() => setSelectedProfile(null)}
              >
                <Text className="text-white text-xs">✖</Text>
              </TouchableOpacity>

              {/* Cinematic Slow Reveal */}
              <View className="mb-6 w-32 h-32 rounded-full overflow-hidden border-4 border-tingle-primary/50 relative">
                <FrostedGlassReveal revealProgress={revealedProfiles.has(selectedProfile.id) ? 1 : 0}>
                  <Image
                    source={{ uri: selectedProfile.avatarUrl }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </FrostedGlassReveal>
              </View>

              <Text className="text-2xl text-white font-bold mb-1">{selectedProfile.username}</Text>
              <View className="flex-row items-center mb-6 space-x-2">
                <Mic size={16} color="#a855f7" />
                <Text className="text-tingle-primary text-sm ml-2">{selectedProfile.favTrigger} Lover</Text>
              </View>

              <Text className="text-gray-400 text-center mb-8 leading-relaxed">
                &quot;{selectedProfile.favTrigger} sesiyle uyumayı seviyorum. Tingle&apos;da sessizce kitap okuyabileceğimiz bir &apos;Binaural Date&apos; arıyorum.&quot;
              </Text>

              {/* Wingman */}
              <View className="bg-white/5 p-3 rounded-lg mb-6 w-full border border-white/5">
                <Text className="text-purple-400 text-xs font-bold mb-1 uppercase">Somnus Wingman 🧚‍♂️</Text>
                <Text className="text-gray-300 italic text-xs">&quot;O da şu an {selectedProfile.favTrigger} dinliyor. 'En sevdiğin kitap?' diye sorabilirsin.&quot;</Text>
              </View>

              {showRecorder ? (
                <WhisperRecorder receiverId={selectedProfile.id} onSent={() => setShowRecorder(false)} />
              ) : (
                <View className="flex-row w-full justify-between space-x-4">
                  <TouchableOpacity
                    className="flex-1 bg-tingle-accent py-4 rounded-xl items-center flex-row justify-center space-x-2"
                    onPress={() => setShowRecorder(true)}
                  >
                    <Mic size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Ses At</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="flex-1 bg-tingle-primary py-4 rounded-xl items-center flex-row justify-center space-x-2"
                    onPress={() => {
                      setRevealedProfiles(prev => new Set(prev).add(selectedProfile.id));
                      alert("Reveal Başladı! 🧊🔥");
                    }}
                  >
                    <Sparkles size={20} color="white" />
                    <Text className="text-white font-medium ml-2">Reveal</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
