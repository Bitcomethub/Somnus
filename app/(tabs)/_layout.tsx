import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { Home, Radio, Sparkles } from 'lucide-react-native';

// Premium Tab Icon with Golden Glow
const PremiumTabIcon = ({ Icon, focused }: { Icon: any, focused: boolean }) => {
  const glowOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (focused) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(0.5, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [focused]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      {/* Golden Glow Effect */}
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#f59e0b',
          },
          glowStyle,
        ]}
      />
      <Icon size={22} color={focused ? '#fbbf24' : '#64748b'} />
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#fbbf24', // Golden amber
        tabBarInactiveTintColor: '#64748b', // Muted gray
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView
            intensity={80}
            tint="dark"
            style={{
              flex: 1,
              backgroundColor: 'rgba(15,12,41,0.8)',
              borderTopWidth: 0.5,
              borderTopColor: 'rgba(255,255,255,0.1)',
            }}
          />
        ),
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: 30,
          },
          default: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            height: 70,
            paddingBottom: 10,
          },
        }),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '300',
          letterSpacing: 1,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vibe',
          tabBarIcon: ({ focused }) => <PremiumTabIcon Icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Sound Wall',
          tabBarIcon: ({ focused }) => <PremiumTabIcon Icon={Radio} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
