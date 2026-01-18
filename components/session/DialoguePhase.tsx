"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Check, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface DialoguePhaseProps {
  initialMessage: string;
  presetId: string;
  onComplete: (messages: Message[]) => void;
}

export default function DialoguePhase({
  initialMessage,
  presetId,
  onComplete,
}: DialoguePhaseProps) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialResponse, setHasInitialResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = useCallback(
    async (userMessage: string, history: Message[]) => {
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId,
            userMessage,
            history: history.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } catch (error) {
        console.error("Error sending message:", error);
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I'm here for you. Sometimes I have trouble connecting, but please continue sharing.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [presetId]
  );

  // Send initial message on mount
  useEffect(() => {
    if (!hasInitialResponse && initialMessage) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: initialMessage,
        timestamp: new Date(),
      };
      setMessages([userMsg]);
      sendMessage(initialMessage, []);
      setHasInitialResponse(true);
    }
  }, [initialMessage, hasInitialResponse, sendMessage]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: inputValue.trim(),
        timestamp: new Date(),
      };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      sendMessage(inputValue.trim(), messages);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDone = () => {
    onComplete(messages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-3xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] px-5 py-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-white text-[#4A4A4A] rounded-br-md shadow-sm"
                  : "text-white rounded-bl-md"
              }`}
              style={
                message.role === "assistant"
                  ? { backgroundColor: colors.accent }
                  : {}
              }
            >
              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">:)</span>
                  </div>
                  <span className="text-xs opacity-80">Rambl</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              <span
                className={`text-xs mt-2 block ${
                  message.role === "user" ? "text-[#9A9A9A]" : "opacity-70"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div
              className="px-5 py-4 rounded-2xl rounded-bl-md text-white"
              style={{ backgroundColor: colors.accent }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm">:)</span>
                </div>
                <span className="text-xs opacity-80">Rambl</span>
              </div>
              <div className="flex space-x-1">
                <div
                  className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-[#F0F0F0]">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type here..."
              disabled={isLoading}
              className="flex-1 bg-[#F5F5F5] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder-[#9A9A9A] focus:outline-none focus:ring-2 transition-all"
              style={
                {
                  "--tw-ring-color": colors.accent,
                } as React.CSSProperties
              }
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: colors.accent }}
            >
              <Send size={20} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F0F0]">
            <button
              onClick={handleDone}
              disabled={messages.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4A4A4A] text-white rounded-full font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Check size={18} />
              I&apos;m Done
            </button>
            <button
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-colors cursor-pointer"
              style={{
                backgroundColor: `${colors.accent}15`,
                color: colors.accent,
              }}
            >
              Continue
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
