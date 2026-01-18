"use client";

import { useState, useRef, useCallback } from "react";
import { MessageSquare, Mic } from "lucide-react";
import ChatDisplay, { Message } from "./ChatDisplay";
import ChatInput from "./ChatInput";
import VoiceRecorder from "./VoiceRecorder";
import { presets, PromptPreset, getPresetById } from "@/lib/prompts";

type ChatMode = "text" | "voice";

export default function ChatInterface() {
    const [mode, setMode] = useState<ChatMode>("text");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<PromptPreset>(presets[0]);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const sendMessage = useCallback(async (userMessage: string, presetId: string) => {
        // Add user message to chat
        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userMessage,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            // Send to Gemini API with conversation history
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    presetId,
                    userMessage,
                    // Send existing messages as history (before adding the new user message)
                    history: messages.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                })
            });

            if (!response.ok) {
                throw new Error("Failed to get response");
            }

            const data = await response.json();
            const aiText = data.text;

            // Add AI response to chat
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: aiText,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);

            // If in voice mode, convert response to speech
            if (mode === "voice") {
                const preset = getPresetById(presetId);
                const voiceId = preset?.voiceId || presets[0].voiceId;

                try {
                    const ttsResponse = await fetch("/api/elevenlabs", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            text: aiText,
                            voiceId
                        })
                    });

                    if (ttsResponse.ok) {
                        const audioBlob = await ttsResponse.blob();
                        const audioUrl = URL.createObjectURL(audioBlob);
                        
                        // Play the audio
                        if (audioRef.current) {
                            audioRef.current.src = audioUrl;
                            audioRef.current.play();
                        }
                    }
                } catch (ttsError) {
                    console.error("TTS error:", ttsError);
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please try again.",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [mode, messages]);

    const handlePresetChange = (preset: PromptPreset) => {
        setSelectedPreset(preset);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto">
            {/* Mode tabs - pill-shaped buttons */}
            <div className="flex justify-center mb-6">
                <div className="bg-white rounded-full p-1 shadow-soft flex gap-1">
                    <button
                        onClick={() => setMode("text")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                            mode === "text"
                                ? "bg-[#7EC8E3] text-white shadow-pastel-blue"
                                : "text-[#7A7A7A] hover:bg-[#F5F5F5]"
                        }`}
                    >
                        <MessageSquare className="w-5 h-5" />
                        <span>Text</span>
                    </button>
                    <button
                        onClick={() => setMode("voice")}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                            mode === "voice"
                                ? "bg-[#7EC8E3] text-white shadow-pastel-blue"
                                : "text-[#7A7A7A] hover:bg-[#F5F5F5]"
                        }`}
                    >
                        <Mic className="w-5 h-5" />
                        <span>Voice</span>
                    </button>
                </div>
            </div>

            {/* Chat display area */}
            <div className="flex-1 min-h-0 mb-4">
                <ChatDisplay messages={messages} isLoading={isLoading} />
            </div>

            {/* Input area - switches based on mode */}
            <div className="flex-shrink-0">
                {mode === "text" ? (
                    <ChatInput
                        onSendMessage={sendMessage}
                        isLoading={isLoading}
                        selectedPreset={selectedPreset}
                        onPresetChange={handlePresetChange}
                    />
                ) : (
                    <VoiceRecorder
                        onSendMessage={sendMessage}
                        isLoading={isLoading}
                        selectedPreset={selectedPreset}
                        onPresetChange={handlePresetChange}
                    />
                )}
            </div>

            {/* Hidden audio element for TTS playback */}
            <audio ref={audioRef} className="hidden" />
        </div>
    );
}
