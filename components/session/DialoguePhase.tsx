"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Check, ArrowRight, Smile } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Image from "next/image";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSentRef = useRef(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

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
    if (initialMessageSentRef.current || !initialMessage) {
      return;
    }

    // Mark as sent immediately to prevent double-send in Strict Mode
    initialMessageSentRef.current = true;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: initialMessage,
      timestamp: new Date(),
    };
    setMessages([userMsg]);
    sendMessage(initialMessage, []);
  }, [initialMessage, sendMessage]);

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
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {/* AI Avatar */}
            {message.role === "assistant" && (
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                style={{ backgroundColor: colors.accent }}
              >
                <Image
                  src="/icon.svg"
                  alt="Rambl"
                  width={24}
                  height={24}
                  className="w-6 h-6 brightness-0 invert"
                />
              </div>
            )}

            <div
              className={`max-w-[75%] ${
                message.role === "user" ? "order-first" : ""
              }`}
            >
              {/* Sender name */}
              <p
                className={`text-xs font-medium mb-1.5 ${
                  message.role === "user" ? "text-right text-[#7A7A7A]" : ""
                }`}
                style={
                  message.role === "assistant"
                    ? { color: colors.accentDark }
                    : {}
                }
              >
                {message.role === "assistant" ? "Rambl" : "You"}
              </p>

              {/* Message bubble */}
              <div
                className={`px-4 py-3 rounded-2xl shadow-sm ${
                  message.role === "user"
                    ? "bg-white text-[#4A4A4A] rounded-br-sm border border-[#F0F0F0]"
                    : "text-white rounded-bl-sm"
                }`}
                style={
                  message.role === "assistant"
                    ? { backgroundColor: colors.accent }
                    : {}
                }
              >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>

              {/* Timestamp */}
              <p
                className={`text-[11px] mt-1.5 ${
                  message.role === "user" ? "text-right" : ""
                } text-[#9A9A9A]`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* User Avatar */}
            {message.role === "user" && (
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4A4A4A] flex items-center justify-center shadow-sm">
                <Smile size={20} className="text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: colors.accent }}
            >
              <Image
                src="/icon.svg"
                alt="Rambl"
                width={24}
                height={24}
                className="w-6 h-6 brightness-0 invert"
              />
            </div>
            <div>
              <p
                className="text-xs font-medium mb-1.5"
                style={{ color: colors.accentDark }}
              >
                Rambl
              </p>
              <div
                className="px-5 py-4 rounded-2xl rounded-bl-sm text-white shadow-sm"
                style={{ backgroundColor: colors.accent }}
              >
                <div className="flex space-x-1.5">
                  <div
                    className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-white/80 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2">
        <div className="bg-white rounded-2xl shadow-lg border border-[#F0F0F0] overflow-hidden">
          {/* Text input */}
          <div className="p-4 pb-3">
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share what's on your mind..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-[#F8F8F8] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder-[#9A9A9A] focus:outline-none focus:ring-2 transition-all resize-none text-[15px] leading-relaxed"
                style={
                  {
                    "--tw-ring-color": colors.accent,
                  } as React.CSSProperties
                }
              />
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer flex-shrink-0"
                style={{ backgroundColor: colors.accent }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#FAFAFA] border-t border-[#F0F0F0]">
            <button
              onClick={handleDone}
              disabled={messages.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4A4A4A] text-white rounded-full font-medium hover:bg-[#3A3A3A] transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer text-sm"
            >
              <Check size={16} />
              I&apos;m Done
            </button>
            <button
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all hover:shadow-md cursor-pointer text-sm"
              style={{
                backgroundColor: `${colors.accentLight}40`,
                color: colors.accentDark,
              }}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
