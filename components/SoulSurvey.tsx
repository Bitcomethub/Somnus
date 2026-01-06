import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Dimensions, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { ArrowRight, Heart, CloudLightning, Coffee, Wind, Check } from 'lucide-react-native';
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface Props {
    visible: boolean;
    onComplete: (data: { preference: string, safeSpace: string, goal: string }) => void;
}

const QUESTIONS = [
    {
        id: 1,
        question: "Hangi sessizlik seni daha güvende hissettirir?",
        options: [
            { label: "Yağmurlu Kütüphane", icon: CloudLightning, val: "rainy_library" },
            { label: "Gece Treni", icon: Wind, val: "night_train" },
            { label: "Boş Kafe", icon: Coffee, val: "empty_cafe" },
        ]
    },
    {
        id: 2,
        question: "Somnus'ta ne arıyorsun?",
        options: [
            { label: "Derin Sohbet", icon: Heart, val: "deep_talk" },
            { label: "Sessiz Eşlikçi", icon: Wind, val: "silent_company" },
            { label: "Sadece Uyku", icon: CloudLightning, val: "just_sleep" },
        ]
    },
    {
        id: 3,
        question: "Hayalindeki Güvenli Alanı tarif et...",
        type: 'text'
    }
];

export default function SoulSurvey({ visible, onComplete }: Props) {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState({ preference: '', goal: '', safeSpace: '' });
    const [textInput, setTextInput] = useState('');

    const handleNext = (val?: string) => {
        if (step === 0) setAnswers(prev => ({ ...prev, preference: val! }));
        if (step === 1) setAnswers(prev => ({ ...prev, goal: val! }));
        if (step === 2 && textInput) {
            const finalData = { ...answers, safeSpace: textInput };
            onComplete(finalData);
            return;
        }
        setStep(prev => prev + 1);
    };

    if (!visible) return null;

    const currentQ = QUESTIONS[step];

    return (
        <Modal transparent animationType="fade">
            <BlurView intensity={95} tint="dark" style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <View className="w-full px-8">
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">
                        Ruh Anketi {step + 1}/{QUESTIONS.length}
                    </Text>

                    <Animated.View
                        key={step}
                        entering={SlideInRight}
                        exiting={SlideOutLeft}
                        className="bg-tingle-card p-8 rounded-3xl border border-white/10 shadow-2xl"
                    >
                        <Text className="text-white text-2xl font-bold mb-8 leading-tight">
                            {currentQ.question}
                        </Text>

                        {currentQ.options ? (
                            <View className="gap-4">
                                {currentQ.options.map((opt) => (
                                    <TouchableOpacity
                                        key={opt.val}
                                        onPress={() => handleNext(opt.val)}
                                        className="flex-row items-center bg-white/5 p-4 rounded-xl border border-white/5 active:bg-white/10"
                                    >
                                        <opt.icon color="#a855f7" size={24} />
                                        <Text className="text-gray-200 text-lg ml-4 font-medium">{opt.label}</Text>
                                        <View className="flex-1 items-end">
                                            <ArrowRight color="#64748b" size={16} />
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <View>
                                <TextInput
                                    className="bg-white/5 text-white p-4 rounded-xl text-lg min-h-[100px] border border-white/10"
                                    placeholder="Örn: Mars'ta cam bir fanus..."
                                    placeholderTextColor="#64748b"
                                    multiline
                                    value={textInput}
                                    onChangeText={setTextInput}
                                    autoFocus
                                />
                                <TouchableOpacity
                                    onPress={() => handleNext()}
                                    className="mt-6 bg-tingle-primary py-4 rounded-xl items-center flex-row justify-center"
                                >
                                    <Text className="text-white font-bold text-lg mr-2">Tamamla</Text>
                                    <Check color="white" size={20} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </BlurView>
        </Modal>
    );
}
