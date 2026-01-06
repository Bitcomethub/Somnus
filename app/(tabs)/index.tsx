import { Wind, CloudRain, Zap, Mic, Heart, Headphones, Moon, Sparkles } from 'lucide-react-native';
import axios from 'axios';
import { API_URL } from '@/constants/API';
import WhisperRecorder from '@/components/WhisperRecorder';
import VisualCalibrator from '@/components/VisualCalibrator';
import { TextInput, ActivityIndicator } from 'react-native';
import SleepSyncScreen from '@/components/SleepSyncScreen';
import ShieldSelector, { ShieldMode } from '@/components/ShieldSelector';
import SplashScreen from '@/components/SplashScreen';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import io from 'socket.io-client';
import BreathingLight from '@/components/BreathingLight'; // Phase 14
import MicroSurvey from '@/components/MicroSurvey'; // Phase 14
import FrostedGlassReveal from '@/components/FrostedGlassReveal'; // Phase 14
import VideoBackground from '@/components/VideoBackground';

// Static profiles removed in favor of API


const soundWallItems = [
  { id: 1, title: 'Midnight Rain', user: 'Elara', duration: '10s' },
  { id: 2, title: 'Page Turning', user: 'BookLvr', duration: '15s' },
];

const RECOMMENDED_VIBES = ["Tired from work", "Need focus", "Anxious", "Just waking up"];

export default function HomeScreen() { // Ensure Component Declaration Exists if implied context
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showRecorder, setShowRecorder] = useState(false);
  const [showSleepMode, setShowSleepMode] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showSurvey, setShowSurvey] = useState(true); // Phase 14: Default TRUE for MVP
  const [emberBalance] = useState(42);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [revealedProfiles, setRevealedProfiles] = useState<Set<number>>(new Set());

  // Shield State
  const [activeShield, setActiveShield] = useState<ShieldMode>(null);
  const [shieldCounts, setShieldCounts] = useState<Record<string, number>>({});
  const [showMicroSurvey, setShowMicroSurvey] = useState(false); // Phase 14
  const shieldSocket = useRef<any>(null);
  const shieldSound = useRef<Audio.Sound | null>(null);

  // Assets
  const SHIELD_SOUNDS: Record<string, any> = {
    'commuter': require('../../assets/sounds/shield_commuter.mp3'),
    'office': require('../../assets/sounds/shield_office.mp3'),
    'nomad': require('../../assets/sounds/shield_nomad.mp3'),
    'sky': require('../../assets/sounds/shield_sky.mp3'),
  };

  const SHIELD_VIDEOS: Record<string, any> = {
    'commuter': { uri: 'https://static.videezy.com/system/resources/previews/000/005/016/original/Subway_Train_Passing_Platform.mp4' }, // Placeholder 
    'office': { uri: 'https://static.videezy.com/system/resources/previews/000/008/296/original/View_of_busy_office.mp4' },
    'nomad': { uri: 'https://static.videezy.com/system/resources/previews/000/004/937/original/Foggy_Pine_Wood_Forest.mp4' },
    'sky': { uri: 'https://static.videezy.com/system/resources/previews/000/005/527/original/Clouds_Time_Lapse_1080p.mp4' },
  };

  const handleShieldSelect = async (mode: ShieldMode) => {
    setActiveShield(mode);

    // 1. Socket Logic
    if (shieldSocket.current && mode) {
      shieldSocket.current.emit('join_shield_room', mode);
    }

    // 2. Audio Logic (Multi-Track Mixer Base) 🎚️
    if (shieldSound.current) {
      await shieldSound.current.unloadAsync();
      shieldSound.current = null;
    }

    if (mode) {
      try {
        const { sound } = await Audio.Sound.createAsync(
          SHIELD_SOUNDS[mode],
          { shouldPlay: true, isLooping: true, volume: 0.8 }
        );
        shieldSound.current = sound;
      } catch (e) { console.log('Shield Audio Error', e); }
    }
  };

  const sendHeartbeat = () => {
    if (activeShield && shieldSocket.current) {
      shieldSocket.current.emit('shield_heartbeat', { shieldMode: activeShield });
      alert("Silent High-Five sent! 👋");
    }
  };

  useEffect(() => {
    // Initialize Shield Socket
    shieldSocket.current = io(API_URL);

    shieldSocket.current.on('shield_count', (data: { mode: string, count: number }) => {
      setShieldCounts(prev => ({ ...prev, [data.mode]: data.count }));
    });

    return () => {
      shieldSocket.current?.disconnect();
      if (shieldSound.current) shieldSound.current.unloadAsync();
    };
  }, []);

  // Zero-Look Deep Link Handler ⚡
  // Handles: somnus://play/shield/[mode]
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url.includes('play/shield')) {
        const parts = url.split('/');
        const mode = parts[parts.length - 1] as ShieldMode;
        if (SHIELD_SOUNDS[mode]) {
          handleShieldSelect(mode);
          alert(`Sir/Widget launched: ${mode}`);
        }
      }
    };
    /* 
       Note: In a real Expo build, use Linking.addEventListener('url', handleDeepLink). 
       For now, we conceptually integrate it as requested in Master Blueprint.
    */
  }, []);

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
        setProfiles([
          { id: 1, username: 'Elara', favTrigger: 'Rain', avatarUrl: 'https://images.unsplash.com/photo-1493666438817-866a91353ca9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
          { id: 2, username: 'Kael', favTrigger: 'Wind', avatarUrl: 'https://images.unsplash.com/photo-1542596594-649edbc13630?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' },
        ]);
      }
    }
    fetchUsers();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const pulseScale = useSharedValue(1);
  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1,
      true
    );
    // AI Vibe Check
    const [vibeText, setVibeText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleVibeCheck = async (text: string) => {
      if (!text.trim()) return;
      setIsAnalyzing(true);
      setVibeText(text);
      try {
        // Call Backend AI
        const res = await axios.post(`${API_URL}/vibe-check`, { statusText: text });
        const { mode, vibe } = res.data;

        // Auto-switch Shield
        if (mode) handleShieldSelect(mode as ShieldMode);
        alert(`Somnus AI: Switching to ${mode} mode for "${vibe}" vibes.`);
      } catch (e) {
        // Fallback
        handleShieldSelect('nomad');
      } finally {
        setIsAnalyzing(false);
      }
    }

    const pulseStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }]
    }));

    return (
      <SafeAreaView className="flex-1 bg-tingle-bg">
        <StatusBar barStyle="light-content" />

        {/* Premium Video Background */}
        <VideoBackground
          source={activeShield ? SHIELD_VIDEOS[activeShield] : null}
          isActive={!!activeShield}
        />

        {/* Phase 14: Living Device 🫁 */}
        <BreathingLight isActive={!!activeShield} color="#a855f7" bpm={12} />

        <SleepSyncScreen visible={showSleepMode} onClose={() => setShowSleepMode(false)} />
        <VisualCalibrator />
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>

          {/* Header */}
          <View className="px-6 pt-6 pb-4">
            <View className="flex-row justify-between items-center mb-6">
              {/* Sleep Mode Trigger */}
              <TouchableOpacity onPress={() => setShowSleepMode(true)} className="bg-tingle-card p-2 rounded-full mr-2">
                <Moon color="#8B5CF6" size={24} />
              </TouchableOpacity>

              <Image
                source={require('../../assets/somnus-banner.png')}
                style={{ width: 140, height: 60, resizeMode: 'contain' }}
              />

              <View className="flex-row items-center space-x-2">
                <View className="bg-tingle-card px-3 py-1 rounded-full flex-row items-center border border-orange-500/30">
                  <Text className="text-orange-500 font-bold mr-1">🔥 {emberBalance}</Text>
                </View>
                <TouchableOpacity className="bg-tingle-card p-2 rounded-full">
                  <Headphones color="#a855f7" size={24} />
                </TouchableOpacity>
              </View>
            </View>
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

          {/* Silent High Five Button (Visible when Shield Active) */}
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
          <Text className="text-gray-400 text-sm mb-4 tracking-wider uppercase font-medium">Senin Sesdaşların</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 overflow-visible">
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
          <View className="mb-8">
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

          onAnswer={(ans) => {
            setShowMicroSurvey(false);
            alert(`Somnus AI: Not edildi (${ans}). Frekansına uygun birini bulduğumda haber vereceğim. ✨`);
          }}
          onDismiss={() => setShowMicroSurvey(false)}
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

                  {/* Phase 14: Cinematic Slow Reveal 🎥 */}
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
                          // Demo: Trigger Reveal Animation
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
      </SafeAreaView >
    );
  }
