import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { Sparkles, X } from 'lucide-react-native';

interface Props {
    visible: boolean;
    question: string;
    onAnswer: (answer: string) => void;
    onDismiss: () => void;
}

export default function MicroSurvey({ visible, question, onAnswer, onDismiss }: Props) {
    if (!visible) return null;

    return (
        <Animated.View
            entering={FadeInUp.delay(500)}
            exiting={FadeOutDown}
            className="absolute bottom-32 right-6 left-6 bg-tingle-card/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg z-50"
        >
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center space-x-2">
                    <Sparkles size={14} color="#a855f7" />
                    <Text className="text-purple-400 text-xs font-bold uppercase">Somnus AI</Text>
                </View>
                <TouchableOpacity onPress={onDismiss}>
                    <X size={14} color="#64748b" />
                </TouchableOpacity>
            </View>

            <Text className="text-white text-sm font-medium mb-4 leading-relaxed">
                {question}
            </Text>

            <View className="flex-row space-x-2">
                <TouchableOpacity
                    onPress={() => onAnswer('Yes')}
                    className="flex-1 bg-white/10 py-2 rounded-lg items-center active:bg-white/20"
                >
                    <Text className="text-white text-xs">Evet 🌊</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => onAnswer('No')}
                    className="flex-1 bg-white/10 py-2 rounded-lg items-center active:bg-white/20"
                >
                    <Text className="text-white text-xs">Hayır ☁️</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
}
