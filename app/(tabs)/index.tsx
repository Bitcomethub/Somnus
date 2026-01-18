import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Audio } from 'expo-av';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { Headphones, Heart, Mic, Moon, Radio, Shield, Sparkles, Wallet } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import io from 'socket.io-client';

import BreathingLight from '@/components/BreathingLight';
import ExploreGallery from '@/components/ExploreGallery';
import FrostedGlassReveal from '@/components/FrostedGlassReveal';
import GhostModePanel from '@/components/GhostModePanel';
import GiftingPalette from '@/components/GiftingPalette';
import JamRoom from '@/components/JamRoom';
import MicroSurvey from '@/components/MicroSurvey';
import PremiumLogo from '@/components/PremiumLogo';
import SensoryProfiler from '@/components/SensoryProfiler';
import SensoryTracer from '@/components/SensoryTracer';
import SerenityOnboarding from '@/components/SerenityOnboarding';
import ShieldSelector, { ShieldMode } from '@/components/ShieldSelector';
import SleepSyncScreen from '@/components/SleepSyncScreen';
import SleepTimer from '@/components/SleepTimer';
import SplashScreen from '@/components/SplashScreen';
import VideoBackground from '@/components/VideoBackground';
import VisualCalibrator from '@/components/VisualCalibrator';
import WalletScreen from '@/components/WalletScreen';
import WhisperRecorder from '@/components/WhisperRecorder';
import WorldShield from '@/components/WorldShield';
import { API_URL } from '@/constants/API';

// --- Constants ---
const SHIELD_SOUNDS: Record<string, { uri: string }> = {
  'commuter': { uri: 'https://www.soundjay.com/transportation/sounds/train-1.mp3' },
  'office': { uri: 'https://www.soundjay.com/human/sounds/keyboard-typing-2.mp3' },
  'nomad': { uri: 'https://www.soundjay.com/nature/sounds/rain-01.mp3' },
  'sky': { uri: 'https://www.soundjay.com/nature/sounds/wind-howl-1.mp3' },
};

const SHIELD_VIDEOS: Record<string, any> = {
  'commuter': { uri: 'https://static.videezy.com/system/resources/previews/000/005/016/original/Subway_Train_Passing_Platform.mp4' },
  'office': { uri: 'https://static.videezy.com/system/resources/previews/000/008/296/original/View_of_busy_office.mp4' },
  'nomad': { uri: 'https://static.videezy.com/system/resources/previews/000/004/937/original/Foggy_Pine_Wood_Forest.mp4' },
  'sky': { uri: 'https://static.videezy.com/system/resources/previews/000/005/527/original/Clouds_Time_Lapse_1080p.mp4' },
};

export default function HomeScreen() {
  const MOCK_USER_ID = 1;
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showSleepMode, setShowSleepMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [revealedProfiles, setRevealedProfiles] = useState<Set<number>>(new Set());

  const [activeShield, setActiveShield] = useState<ShieldMode>(null);
  const [shieldCounts, setShieldCounts] = useState<Record<string, number>>({});
  const shieldSocket = useRef<any>(null);
  const shieldSound = useRef<Audio.Sound | null>(null);

  const [vibeText, setVibeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showMicroSurvey, setShowMicroSurvey] = useState(false);
  const [showProfiler, setShowProfiler] = useState(false);
  const [showJam, setShowJam] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showWorldShield, setShowWorldShield] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [profileMatchInfo, setProfileMatchInfo] = useState<any>(null);

  const [showSleepTimer, setShowSleepTimer] = useState(false);
  const [showGhostPanel, setShowGhostPanel] = useState(false);
  const [isGhostMode, setIsGhostMode] = useState(false);

  const pulseScale = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${API_URL}/wallet/balance/${MOCK_USER_ID}`);
      setUserBalance(res.data.balance);
    } catch (e) { }
  };

  const handleShieldSelect = async (mode: ShieldMode) => {
    setActiveShield(mode);
    setVibeText("");
    if (mode) AsyncStorage.setItem('somnus_last_shield', mode);
    else AsyncStorage.removeItem('somnus_last_shield');

    if (shieldSocket.current && mode) shieldSocket.current.emit('join_shield_room', mode);

    const oldSound = shieldSound.current;
    if (mode && SHIELD_SOUNDS[mode]) {
      try {
        const { sound: newSound } = await Audio.Sound.createAsync(SHIELD_SOUNDS[mode], { shouldPlay: true, isLooping: true, volume: 0 });
        shieldSound.current = newSound;
        const fadeIn = async () => {
          for (let vol = 0; vol <= 0.8; vol += 0.1) {
            await newSound.setVolumeAsync(vol);
            await new Promise(r => setTimeout(r, 150));
          }
        };
        fadeIn();
      } catch (e) { }
    } else shieldSound.current = null;

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
        } catch (e) { }
      };
      fadeOut();
    }
  };

  const handleProfileClick = async (profile: any) => {
    setSelectedProfile(profile);
    setProfileMatchInfo(null);
    try {
      const res = await axios.post(`${API_URL}/match-score`, {
        userAId: MOCK_USER_ID,
        userBId: profile.id
      });
      setProfileMatchInfo(res.data);
    } catch (e) { }
  };

  const handleReveal = async (profileId: number) => {
    try {
      const res = await axios.post(`${API_URL}/reveal-user`, { userId: profileId });
      if (res.data.avatarUrl) {
        setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, avatarUrl: res.data.avatarUrl } : p));
        setRevealedProfiles(prev => new Set(prev).add(profileId));
      }
    } catch (e) { }
  };

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const launched = await AsyncStorage.getItem('somnus_launched');
      if (!launched) {
        setShowOnboarding(true);
        await AsyncStorage.setItem('somnus_launched', 'true');
      }
    };
    checkFirstLaunch();

    shieldSocket.current = io(API_URL);
    shieldSocket.current.on('shield_count', (data: { mode: string, count: number }) => {
      setShieldCounts(prev => ({ ...prev, [data.mode]: data.count }));
    });

    shieldSocket.current.on('gift_received', ({ giftType }: any) => {
      if (giftType === 'HAPTIC_PULSE') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    });

    return () => {
      shieldSocket.current?.disconnect();
      if (shieldSound.current) shieldSound.current.unloadAsync();
    };
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_URL}/users`);
        if (res.data && res.data.length > 0) setProfiles(res.data);
      } catch (e) { }
    };
    fetchUsers();
    fetchBalance();

    const timer = setTimeout(() => setShowMicroSurvey(true), 12000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen onFinish={() => setShowSplash(false)} />;
  if (showOnboarding) return <SerenityOnboarding onFinish={() => setShowOnboarding(false)} />;

  return (
    <SafeAreaView className="flex-1 bg-tingle-bg">
      <StatusBar barStyle="light-content" />
      <VideoBackground source={activeShield ? SHIELD_VIDEOS[activeShield] : null} isActive={!!activeShield} mode={activeShield || 'default'} />
      <BreathingLight isActive={!!activeShield} mode={activeShield || 'default'} bpm={12} />
      <SleepSyncScreen visible={showSleepMode} onClose={() => setShowSleepMode(false)} />
      <VisualCalibrator />
      <WorldShield isActive={showWorldShield} onToggle={() => setShowWorldShield(false)} />
      <JamRoom visible={showJam} onClose={() => { setShowJam(false); fetchBalance(); }} userId={MOCK_USER_ID} />

      <Modal visible={showWallet} animationType="slide">
        <WalletScreen userId={MOCK_USER_ID} onClose={() => { setShowWallet(false); fetchBalance(); }} />
      </Modal>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} style={{ zIndex: 10 }}>
        <View className="pt-4 pb-2">
          <View className="flex-row justify-between items-center px-4 mb-4">
            <TouchableOpacity onPress={() => setShowWorldShield(true)} className="bg-purple-900/30 p-2.5 rounded-full border border-purple-500/30">
              <Shield color="#a855f7" size={22} />
            </TouchableOpacity>
            <View className="flex-row items-center space-x-2">
              <TouchableOpacity onPress={() => setShowWallet(true)} className="bg-tingle-card/50 px-3 py-1.5 rounded-full flex-row items-center border border-purple-500/20">
                <Text className="text-purple-400 font-bold text-xs">{userBalance} TT</Text>
                <Wallet color="#a855f7" size={14} className="ml-1.5" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowJam(true)} className="bg-purple-900/40 px-3 py-2 rounded-full flex-row items-center border border-purple-500/30">
                <Radio color="#a855f7" size={16} />
                <Text className="text-purple-400 font-bold text-[10px] ml-1 uppercase">Live Jam</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSleepTimer(true)} className="bg-tingle-card/50 p-2.5 rounded-full">
                <Moon color="#fbbf24" size={18} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowGhostPanel(true)} className="bg-tingle-card/50 p-2.5 rounded-full">
                <Headphones color={isGhostMode ? "#a855f7" : "#64748b"} size={22} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowProfiler(true)} className="bg-tingle-primary/20 p-2.5 rounded-full border border-tingle-primary/30 ml-2">
                <Sparkles color="#a855f7" size={22} />
              </TouchableOpacity>
            </View>
          </View>
          <PremiumLogo mode={activeShield || 'default'} />
        </View>

        <View className="mx-6 mb-6">
          <View className="flex-row items-center bg-tingle-card/60 rounded-2xl p-3 border border-white/10">
            <TextInput
              placeholder="Ofistesin ve gürültü mü var? Kalkanı aç..."
              placeholderTextColor="#64748b"
              className="flex-1 text-white p-2 text-sm"
              value={vibeText}
              onChangeText={setVibeText}
            />
            <TouchableOpacity onPress={() => setShowWorldShield(true)} className="bg-tingle-primary p-2.5 rounded-xl">
              <Shield size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <ShieldSelector activeMode={activeShield} onSelect={handleShieldSelect} counts={shieldCounts} />
        <SensoryTracer />

        <ExploreGallery />

        <Text className="text-gray-400 text-sm mb-4 tracking-wider uppercase font-medium px-6">Yeni Uyku Bağlantıları</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 pl-6 overflow-visible">
          {profiles.map((profile) => (
            <Animated.View key={profile.id} style={[pulseStyle]} className="mr-5">
              <TouchableOpacity className="items-center" onPress={() => handleProfileClick(profile)} onLongPress={() => handleReveal(profile.id)}>
                <View className="relative">
                  <Image source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/150' }} className="w-20 h-20 rounded-full border-2 border-tingle-primary mb-2" blurRadius={revealedProfiles.has(profile.id) ? 0 : 10} />
                  {!revealedProfiles.has(profile.id) && <View className="absolute inset-0 items-center justify-center z-10"><Mic color="rgba(255,255,255,0.7)" size={24} /></View>}
                </View>
                <Text className="text-white text-xs font-medium">{profile.username}</Text>
                <Text className="text-gray-500 text-[10px]">{profile.favTrigger}</Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </ScrollView>

      <MicroSurvey visible={showMicroSurvey} question="Bu ses seni çocukluğuna mı götürüyor? 🍼" onAnswer={() => setShowMicroSurvey(false)} onDismiss={() => setShowMicroSurvey(false)} />
      <SleepTimer visible={showSleepTimer} onClose={() => setShowSleepTimer(false)} currentSound={shieldSound.current} />
      <GhostModePanel visible={showGhostPanel} onClose={() => setShowGhostPanel(false)} isGhostMode={isGhostMode} onToggleGhost={setIsGhostMode} />

      <Modal visible={showProfiler} animationType="slide" transparent={true}>
        <BlurView intensity={100} tint="dark" className="flex-1 justify-center p-6">
          <SensoryProfiler onSave={() => setShowProfiler(false)} />
          <TouchableOpacity onPress={() => setShowProfiler(false)} className="mt-4 self-center"><Text className="text-gray-500 font-bold">Kapat</Text></TouchableOpacity>
        </BlurView>
      </Modal>

      <Modal animationType="fade" transparent={true} visible={!!selectedProfile} onRequestClose={() => setSelectedProfile(null)}>
        <BlurView intensity={90} tint="dark" className="flex-1 justify-center items-center p-6">
          {selectedProfile && (
            <View className="bg-tingle-card w-full rounded-3xl overflow-hidden shadow-2xl relative">
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
                <TouchableOpacity className="absolute top-4 right-4 bg-tingle-accent p-2 rounded-full z-20" onPress={() => setSelectedProfile(null)}><Text className="text-white text-xs">✖</Text></TouchableOpacity>

                <View className="items-center pt-12 p-8">
                  <View className="mb-6 w-32 h-32 rounded-full overflow-hidden border-4 border-tingle-primary/50 relative">
                    <FrostedGlassReveal revealProgress={revealedProfiles.has(selectedProfile.id) ? 1 : 0}>
                      <Image source={{ uri: selectedProfile.avatarUrl }} className="w-full h-full" resizeMode="cover" />
                    </FrostedGlassReveal>
                  </View>
                  <Text className="text-2xl text-white font-bold mb-1">{selectedProfile.username}</Text>

                  {profileMatchInfo ? (
                    <View className="flex-row items-center bg-purple-500/20 px-4 py-1.5 rounded-full border border-purple-500/30 mb-6">
                      <Heart color="#a855f7" size={14} fill="#a855f7" />
                      <Text className="text-purple-400 font-bold text-xs ml-1.5">%{profileMatchInfo.harmony} Uyku Uyumu</Text>
                    </View>
                  ) : (
                    <ActivityIndicator color="#a855f7" className="mb-6" />
                  )}

                  <Text className="text-gray-400 text-center mb-8 leading-relaxed">"{selectedProfile.favTrigger} bağımlısıyım, gürültüde uyuyamam."</Text>
                  <WhisperRecorder receiverId={selectedProfile.id} onSent={() => setSelectedProfile(null)} />
                </View>

                {profileMatchInfo && (
                  <View className="px-8 mt-2">
                    <View className="bg-white/5 p-4 rounded-2xl border border-white/5">
                      <Text className="text-gray-400 text-[10px] font-bold uppercase mb-3">Neden Uyumlusunuz?</Text>
                      <View className="flex-row items-center mb-2">
                        <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                        <Text className="text-white text-xs">İkiniz de "7/24 Arka Plan Sesi" olmadan uyuyamıyorsunuz.</Text>
                      </View>
                      <View className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
                        <Text className="text-white text-xs">Aynı "Safe Space" (Kütüphane) tercihine sahipsiniz.</Text>
                      </View>
                    </View>
                  </View>
                )}

                <View className="w-full mt-4 border-t border-white/5 px-8 pt-8">
                  <GiftingPalette
                    senderId={MOCK_USER_ID}
                    receiverId={selectedProfile.id}
                    socket={shieldSocket.current}
                    onSent={() => fetchBalance()}
                  />
                </View>
              </ScrollView>
            </View>
          )}
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}
