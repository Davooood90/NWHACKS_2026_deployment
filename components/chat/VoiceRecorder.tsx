"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Mic, MicOff, Send } from "lucide-react";
import { ChevronUp } from "lucide-react";
import { presets, PromptPreset } from "@/lib/prompts";

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
    start(): void;
    stop(): void;
    abort(): void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface VoiceRecorderProps {
    onSendMessage: (message: string, presetId: string) => void;
    isLoading?: boolean;
    selectedPreset: PromptPreset;
    onPresetChange: (preset: PromptPreset) => void;
}

// Check browser support for Speech Recognition (only runs on client)
const checkSpeechRecognitionSupport = () => {
    if (typeof window === "undefined") return true;
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
};

export default function VoiceRecorder({
    onSendMessage,
    isLoading,
    selectedPreset,
    onPresetChange
}: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isSupported] = useState(checkSpeechRecognitionSupport);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initialize speech recognition
    useEffect(() => {
        if (typeof window === "undefined" || !isSupported) return;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
            let finalTranscript = "";
            let interimTranscript = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalTranscript += result[0].transcript;
                } else {
                    interimTranscript += result[0].transcript;
                }
            }

            setTranscript((prev) => {
                if (finalTranscript) {
                    return prev + finalTranscript;
                }
                return prev + interimTranscript;
            });
        };

        recognitionRef.current.onerror = () => {
            setIsRecording(false);
        };

        recognitionRef.current.onend = () => {
            setIsRecording(false);
        };

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, [isSupported]);

    const toggleRecording = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
            setIsRecording(false);
        } else {
            setTranscript("");
            recognitionRef.current.start();
            setIsRecording(true);
        }
    }, [isRecording]);

    const handleSubmit = () => {
        if (transcript.trim() && !isLoading) {
            onSendMessage(transcript.trim(), selectedPreset.id);
            setTranscript("");
        }
    };

    const getPresetColor = (id: string) => {
        switch (id) {
            case "soothing": return "bg-[#B4F8C8]";
            case "Rational": return "bg-[#A0E7E5]";
            case "Bubbly": return "bg-[#FFAEBC]";
            case "Ragebait": return "bg-[#E0BBE4]";
            default: return "bg-[#7EC8E3]";
        }
    };

    if (!isSupported) {
        return (
            <div className="bg-white rounded-2xl shadow-soft-lg p-4 border border-[#E5E5E5]">
                <div className="text-center text-[#7A7A7A] py-4">
                    <MicOff className="w-8 h-8 mx-auto mb-2 text-[#FFAEBC]" />
                    <p className="text-sm">Voice recording is not supported in your browser.</p>
                    <p className="text-xs mt-1">Try using Chrome or Edge for voice features.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-soft-lg p-4 border border-[#E5E5E5]">
            {/* Transcript display */}
            {transcript && (
                <div className="mb-4 p-3 bg-[#F5F5F5] rounded-xl text-[#4A4A4A] text-sm">
                    <p className="whitespace-pre-wrap">{transcript}</p>
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Recording button */}
                <button
                    onClick={toggleRecording}
                    disabled={isLoading}
                    className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 ${
                        isRecording
                            ? "bg-[#FFAEBC] text-white animate-pulse"
                            : "bg-[#F5F5F5] text-[#4A4A4A] hover:bg-[#E5E5E5]"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isRecording ? (
                        <>
                            <Mic className="w-6 h-6" />
                            <span className="font-medium">Recording... Tap to stop</span>
                        </>
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            <span className="font-medium">Tap to speak</span>
                        </>
                    )}
                </button>

                {/* Mode selector dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 ${getPresetColor(selectedPreset.id)}`}
                        title={`Current mode: ${selectedPreset.name}`}
                    >
                        <ChevronUp 
                            className={`w-5 h-5 text-[#4A4A4A] transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} 
                        />
                    </button>

                    {/* Dropdown menu */}
                    {isDropdownOpen && (
                        <div className="absolute bottom-12 right-0 bg-white rounded-xl shadow-soft-lg border border-[#E5E5E5] py-2 min-w-[180px] z-50">
                            <div className="px-3 py-2 text-xs text-[#7A7A7A] font-medium uppercase tracking-wider border-b border-[#E5E5E5]">
                                Select Mode
                            </div>
                            {presets.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => {
                                        onPresetChange(preset);
                                        setIsDropdownOpen(false);
                                    }}
                                    className={`w-full px-3 py-2 flex items-center gap-3 hover:bg-[#F5F5F5] transition-colors ${
                                        selectedPreset.id === preset.id ? "bg-[#F5F5F5]" : ""
                                    }`}
                                >
                                    <div className={`w-3 h-3 rounded-full ${getPresetColor(preset.id)}`} />
                                    <div className="text-left">
                                        <div className="text-sm font-medium text-[#4A4A4A]">{preset.name}</div>
                                        <div className="text-xs text-[#7A7A7A]">{preset.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Send button */}
                <button
                    onClick={handleSubmit}
                    disabled={!transcript.trim() || isLoading || isRecording}
                    className="w-10 h-10 rounded-full bg-[#7EC8E3] flex items-center justify-center transition-all duration-200 hover:bg-[#5BA3C0] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Send className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Recording indicator */}
            {isRecording && (
                <div className="mt-3 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-[#FFAEBC] rounded-full animate-pulse" />
                    <span className="text-xs text-[#7A7A7A]">Listening...</span>
                </div>
            )}

            {/* Current mode indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs text-[#7A7A7A]">
                <div className={`w-2 h-2 rounded-full ${getPresetColor(selectedPreset.id)}`} />
                <span>Mode: <span className="font-medium text-[#4A4A4A]">{selectedPreset.name}</span></span>
                <span className="ml-auto text-[#A0E7E5]">Voice responses enabled</span>
            </div>
        </div>
    );
}
