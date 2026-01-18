"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Check, Smile, Mic, MicOff, Volume2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import UserAvatar from "@/components/UserAvatar";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { getPresetById } from "@/lib/prompts";

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

type ValidationDepthType = "concise" | "deep";
type ActionStyleType = "gentle" | "direct";

type InputMode = "text" | "voice";

interface DialoguePhaseProps {
  initialMessage: string;
  presetId: string;
  inputMode?: InputMode;
  depth?: ValidationDepthType;
  action?: ActionStyleType;
  onComplete: (messages: Message[]) => void;
}

export default function DialoguePhase({
  initialMessage,
  presetId,
  inputMode = "text",
  depth = "concise",
  action = "gentle",
  onComplete,
}: DialoguePhaseProps) {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMode, setCurrentMode] = useState<InputMode>(inputMode);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialMessageSentRef = useRef(false);
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      const { data: avatarData } = await supabase
        .from("avatar_photos")
        .select("avatar_url")
        .eq("user_id", user?.id)
        .single();
      setUserAvatarUrl(
        avatarData?.avatar_url || user?.user_metadata?.avatar_url || null,
      );
    };
    getUser();
  }, [supabase, user]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for Web Speech API support - lazy initialization
  const [speechSupported] = useState(() => {
    if (typeof window === "undefined") return true;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  });

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container && container.scrollHeight > container.clientHeight) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      const scrollHeight = inputRef.current.scrollHeight;
      const maxHeight = 120;
      inputRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
      inputRef.current.style.overflowY =
        scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [inputValue]);

  // Text-to-speech using ElevenLabs with personality-based voice
  const speakText = useCallback(
    async (text: string) => {
      if (currentMode !== "voice") return;

      try {
        setIsSpeaking(true);

        // Get the voice ID from the preset based on AI personality
        const preset = getPresetById(presetId);
        const voiceId = preset?.voiceId || "JBFqnCBsd6RMkjVDRZzb";

        const response = await fetch("/api/elevenlabs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!response.ok) throw new Error("Failed to generate speech");

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } catch (error) {
        console.error("Error with text-to-speech:", error);
        setIsSpeaking(false);
      }
    },
    [currentMode, presetId],
  );

  // Speech recognition for voice input
  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalTranscript) {
        setInputValue((prev) => prev + (prev ? " " : "") + finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
    };

    recognition.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimTranscript("");
    }
  }, [isRecording]);

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
            depth,
            action,
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

        // Speak the response if in voice mode
        if (currentMode === "voice") {
          speakText(data.text);
        }
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

        if (currentMode === "voice") {
          speakText(errorMsg.content);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [presetId, currentMode, speakText],
  );

  // Send initial message on mount
  useEffect(() => {
    if (initialMessageSentRef.current || !initialMessage) {
      return;
    }

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
    // Stop any ongoing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
    onComplete(messages);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto">
      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <rect
                    width="52"
                    height="52"
                    rx="7"
                    fill="white"
                    fillOpacity="0.9"
                  />
                  <path
                    d="M0 36.7951C5.77778 34.2766 11.5556 34.2766 17.3333 36.7951C23.1111 39.3137 28.8889 39.3137 34.6667 36.7951C40.4444 34.2766 46.2222 34.2766 52 36.7951V46.8692C52 49.3877 49.1111 51.9063 46.2222 51.9063H5.77778C2.88889 51.9063 0 49.3877 0 46.8692V36.7951Z"
                    fill={colors.accentLight}
                  />
                  <path
                    d="M0 27.9517C5.77778 25.2244 11.5556 25.2244 17.3333 27.9517C23.1111 30.679 28.8889 30.679 34.6667 27.9517C40.4444 25.2244 46.2222 25.2244 52 27.9517V38.8608C46.2222 36.1335 40.4444 36.1335 34.6667 38.8608C28.8889 41.5881 23.1111 41.5881 17.3333 38.8608C11.5556 36.1335 5.77778 36.1335 0 38.8608V27.9517Z"
                    fill={`${colors.accentLight}80`}
                  />
                  <ellipse
                    cx="12.3223"
                    cy="12.849"
                    rx="3.32228"
                    ry="3.84899"
                    fill={colors.accentDark}
                  />
                  <ellipse
                    cx="39.3223"
                    cy="12.849"
                    rx="3.32228"
                    ry="3.84899"
                    fill={colors.accentDark}
                  />
                  <path
                    d="M19 22C19 22 25.5 29.5 33 22"
                    stroke={colors.accentDark}
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
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
                {user ? (
                  <UserAvatar
                    avatarUrl={userAvatarUrl}
                    fallbackInitial={user.user_metadata?.full_name}
                    size="sm"
                  />
                ) : (
                  <Smile size={20} className="text-white" />
                )}
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
              >
                <rect
                  width="52"
                  height="52"
                  rx="7"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M0 36.7951C5.77778 34.2766 11.5556 34.2766 17.3333 36.7951C23.1111 39.3137 28.8889 39.3137 34.6667 36.7951C40.4444 34.2766 46.2222 34.2766 52 36.7951V46.8692C52 49.3877 49.1111 51.9063 46.2222 51.9063H5.77778C2.88889 51.9063 0 49.3877 0 46.8692V36.7951Z"
                  fill={colors.accentLight}
                />
                <path
                  d="M0 27.9517C5.77778 25.2244 11.5556 25.2244 17.3333 27.9517C23.1111 30.679 28.8889 30.679 34.6667 27.9517C40.4444 25.2244 46.2222 25.2244 52 27.9517V38.8608C46.2222 36.1335 40.4444 36.1335 34.6667 38.8608C28.8889 41.5881 23.1111 41.5881 17.3333 38.8608C11.5556 36.1335 5.77778 36.1335 0 38.8608V27.9517Z"
                  fill={`${colors.accentLight}80`}
                />
                <ellipse
                  cx="12.3223"
                  cy="12.849"
                  rx="3.32228"
                  ry="3.84899"
                  fill={colors.accentDark}
                />
                <ellipse
                  cx="39.3223"
                  cy="12.849"
                  rx="3.32228"
                  ry="3.84899"
                  fill={colors.accentDark}
                />
                <path
                  d="M19 22C19 22 25.5 29.5 33 22"
                  stroke={colors.accentDark}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
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
      </div>

      {/* Speaking Indicator */}
      {isSpeaking && (
        <div className="flex-shrink-0 px-4 py-2">
          <div
            className="flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto w-fit"
            style={{ backgroundColor: `${colors.accent}20` }}
          >
            <Volume2
              size={16}
              className="animate-pulse"
              style={{ color: colors.accent }}
            />
            <span className="text-sm" style={{ color: colors.accentDark }}>
              Rambl is speaking...
            </span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 px-4 pb-6 pt-2">
        <div className="bg-white rounded-2xl shadow-lg border border-[#F0F0F0] overflow-hidden">
          {/* Mode Toggle for voice users */}
          {speechSupported && (
            <div className="flex items-center gap-2 px-4 pt-3">
              <button
                onClick={() => setCurrentMode("text")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  currentMode === "text"
                    ? "text-white"
                    : "text-[#7A7A7A] bg-[#F5F5F5] hover:bg-[#EBEBEB]"
                }`}
                style={
                  currentMode === "text"
                    ? { backgroundColor: colors.accent }
                    : {}
                }
              >
                <Send size={12} />
                Text
              </button>
              <button
                onClick={() => setCurrentMode("voice")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  currentMode === "voice"
                    ? "text-white"
                    : "text-[#7A7A7A] bg-[#F5F5F5] hover:bg-[#EBEBEB]"
                }`}
                style={
                  currentMode === "voice"
                    ? { backgroundColor: colors.accent }
                    : {}
                }
              >
                <Mic size={12} />
                Voice
              </button>
            </div>
          )}

          {/* Text input with optional mic button */}
          <div className="p-4 pb-3">
            <div className="flex items-center gap-3">
              {/* Voice recording button */}
              {currentMode === "voice" && speechSupported && (
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || isSpeaking}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-105 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer flex-shrink-0 ${
                    isRecording ? "bg-red-500 animate-pulse" : ""
                  }`}
                  style={!isRecording ? { backgroundColor: colors.accent } : {}}
                >
                  {isRecording ? (
                    <MicOff size={18} className="text-white" />
                  ) : (
                    <Mic size={18} className="text-white" />
                  )}
                </button>
              )}

              {/* Textarea container */}
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isRecording
                      ? "Listening..."
                      : currentMode === "voice"
                        ? "Tap the mic or type here..."
                        : "Share what's on your mind..."
                  }
                  disabled={isLoading || isSpeaking}
                  rows={1}
                  className="w-full bg-[#F8F8F8] rounded-xl px-4 py-3 text-[#4A4A4A] placeholder-[#9A9A9A] focus:outline-none focus:ring-2 transition-all resize-none text-[15px] leading-relaxed"
                  style={
                    {
                      "--tw-ring-color": colors.accent,
                    } as React.CSSProperties
                  }
                />
                {/* Interim transcript indicator */}
                {interimTranscript && (
                  <div className="absolute bottom-full left-0 mb-1 px-3 py-1 bg-[#4A4A4A] text-white text-xs rounded-lg max-w-full truncate">
                    {interimTranscript}
                  </div>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading || isSpeaking}
                className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer flex-shrink-0"
                style={{ backgroundColor: colors.accent }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end px-4 py-3 bg-[#FAFAFA] border-t border-[#F0F0F0]">
            <button
              onClick={handleDone}
              disabled={messages.length < 2}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#4A4A4A] text-white rounded-full font-medium hover:bg-[#3A3A3A] transition-all hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer text-sm"
            >
              <Check size={16} />
              I&apos;m Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
