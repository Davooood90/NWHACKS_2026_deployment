"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronUp, Send } from "lucide-react";
import { presets, PromptPreset } from "@/lib/prompts";

interface ChatInputProps {
    onSendMessage: (message: string, presetId: string) => void;
    isLoading?: boolean;
    selectedPreset: PromptPreset;
    onPresetChange: (preset: PromptPreset) => void;
}

export default function ChatInput({ 
    onSendMessage, 
    isLoading, 
    selectedPreset,
    onPresetChange 
}: ChatInputProps) {
    const [message, setMessage] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    const handleSubmit = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim(), selectedPreset.id);
            setMessage("");
            if (textareaRef.current) {
                textareaRef.current.style.height = "auto";
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
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

    return (
        <div className="bg-white rounded-2xl shadow-soft-lg p-4 border border-[#E5E5E5]">
            <div className="flex items-end gap-3">
                {/* Text input area */}
                <div className="flex-1 relative">
                    <textarea
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        disabled={isLoading}
                        rows={1}
                        className="w-full resize-none bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#7EC8E3] transition-all duration-200"
                    />
                </div>

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
                    disabled={!message.trim() || isLoading}
                    className="w-10 h-10 rounded-full bg-[#7EC8E3] flex items-center justify-center transition-all duration-200 hover:bg-[#5BA3C0] hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    <Send className="w-5 h-5 text-white" />
                </button>
            </div>

            {/* Current mode indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs text-[#7A7A7A]">
                <div className={`w-2 h-2 rounded-full ${getPresetColor(selectedPreset.id)}`} />
                <span>Mode: <span className="font-medium text-[#4A4A4A]">{selectedPreset.name}</span></span>
            </div>
        </div>
    );
}
