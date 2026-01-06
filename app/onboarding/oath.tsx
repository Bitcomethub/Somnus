import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, SafeAreaView, Image } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    withSequence,
    FadeIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

const FadeText = ({ children, delay, style: customStyle }: { children: React.ReactNode, delay: number, style?: any }) => {
    const opacity = useSharedValue(0);

    useEffect(() => {
        opacity.value = withDelay(delay, withTiming(1, { duration: 1500 }));
    }, []);

    const animStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: withDelay(delay, withSequence(withTiming(0, { duration: 1500 }))) }]
    }));

    return (
        <Animated.View style={[customStyle, animStyle]}>
            {children}
        </Animated.View>
    );
};

export default function OathScreen() {
    const router = useRouter();
    const buttonOpacity = useSharedValue(0);

    useEffect(() => {
        buttonOpacity.value = withDelay(4000, withTiming(1, { duration: 1000 }));
    }, []);

    const buttonStyle = useAnimatedStyle(() => ({
        opacity: buttonOpacity.value,
        transform: [{ scale: withDelay(4000, withSequence(withTiming(1.05), withTiming(1))) }]
    }));

    const handlePledge = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        await AsyncStorage.setItem('hasPledged', 'true');
        router.push('/onboarding/sound-dna');
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="light" />
            <View style={styles.content}>

                {/* 1. Legendary Logo */}
                <Animated.View entering={FadeIn.duration(2000)} style={styles.logoContainer}>
                    <Image
                        source={require('../../assets/somnus-banner.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </Animated.View>

                {/* 2. Gold Slogan */}
                <FadeText delay={1000} style={styles.textContainer}>
                    <Text style={styles.goldSlogan}>Gürültüyü Kapat,{"\n"}Frekansı Yakala.</Text>
                </FadeText>

                {/* 3. Manifesto */}
                <FadeText delay={2500} style={styles.manifestoContainer}>
                    <Text style={styles.manifestoText}>
                        Burası senin <Text style={{ fontStyle: 'italic', color: '#A855F7' }}>"Weirdo"</Text> sığınağın.
                        {"\n\n"}
                        Cinsellik değil, duyusal bir ortaklık için buradasın.
                    </Text>
                </FadeText>

                {/* 4. Gold Border Button */}
                <Animated.View style={[styles.buttonContainer, buttonStyle]}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handlePledge}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Kabul Ediyorum ve Sesdaş Oluyorum</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F0C29', // Deep Night Blue
    },
    content: {
        flex: 1,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 40,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
    },
    logo: {
        width: width * 0.9,
        height: 180,
    },
    textContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    goldSlogan: {
        color: '#FFD700', // Gold
        fontSize: 26,
        fontWeight: '300', // Mystic light font
        textAlign: 'center',
        letterSpacing: 1.5,
        fontFamily: 'System',
        lineHeight: 36,
        textShadowColor: 'rgba(255, 215, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    manifestoContainer: {
        marginBottom: 60,
        paddingHorizontal: 20,
    },
    manifestoText: {
        color: '#E2E8F0',
        fontSize: 16,
        lineHeight: 24,
        textAlign: 'center',
        fontFamily: 'System',
        fontWeight: '400',
        opacity: 0.9,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
    },
    button: {
        backgroundColor: 'rgba(26, 26, 46, 0.8)', // #1A1A2E with opacity
        paddingVertical: 18,
        paddingHorizontal: 30,
        borderRadius: 30,
        borderWidth: 1.5,
        borderColor: '#FFD700', // Gold Border
        width: '100%',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    buttonText: {
        color: '#FFD700',
        fontSize: 15,
        letterSpacing: 1,
        fontWeight: '600',
        textTransform: 'uppercase',
    }
});
