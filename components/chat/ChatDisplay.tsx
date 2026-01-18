"use client";

import { useEffect, useRef } from "react";

export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatDisplayProps {
    messages: Message[];
    isLoading?: boolean;
}

export default function ChatDisplay({ messages, isLoading }: ChatDisplayProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="relative flex-1 overflow-hidden bg-gradient-to-b from-[#FFF9F5] to-[#F5F0EB] rounded-2xl">
            {/* Mascot placeholder - bottom left, 25% of chat area */}
            <div className="absolute bottom-0 left-0 w-1/4 h-1/4 pointer-events-none z-10 flex items-end justify-start p-4">
                <div className="w-full h-full bg-gradient-to-br from-[#7EC8E3]/30 to-[#A0E7E5]/20 rounded-blob animate-blob-wobble flex items-center justify-center">
                    <div className="text-[#7EC8E3] text-center">
                        <div className="w-16 h-16 mx-auto bg-[#7EC8E3] rounded-full opacity-60 animate-float-gentle" />
                        <span className="text-xs text-[#7A7A7A] mt-2 block">Rambl</span>
                    </div>
                </div>
            </div>

            {/* Messages container */}
            <div className="h-full overflow-y-auto p-6 pb-[28%] space-y-4">
                {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-[#7A7A7A]">
                        <div className="text-center">
                            <div className="w-20 h-20 mx-auto mb-4 bg-[#7EC8E3]/20 rounded-full flex items-center justify-center">
                                <svg 
                                    className="w-10 h-10 text-[#7EC8E3]" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
                                    />
                                </svg>
                            </div>
                            <p className="text-lg font-medium">Ready to rambl?</p>
                            <p className="text-sm mt-1">Start a conversation below</p>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.role === "user" ? "justify-start" : "justify-end"}`}
                    >
                        <div
                            className={`max-w-[70%] px-5 py-3 rounded-2xl shadow-soft ${
                                message.role === "user"
                                    ? "bg-white text-[#4A4A4A] rounded-bl-md"
                                    : "bg-[#7EC8E3] text-white rounded-br-md"
                            }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <span className={`text-xs mt-2 block ${
                                message.role === "user" ? "text-[#7A7A7A]" : "text-white/70"
                            }`}>
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-end">
                        <div className="bg-[#7EC8E3] text-white px-5 py-3 rounded-2xl rounded-br-md shadow-soft">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>
        </div>
    );
}
