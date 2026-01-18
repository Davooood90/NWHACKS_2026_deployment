"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Mic, MicOff, ArrowRight } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

type InputMode = "text" | "voice";

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

interface InitialInputProps {
  onSubmit: (content: string, mode: InputMode) => void;
}

export default function InitialInput({ onSubmit }: InitialInputProps) {
  const { colors } = useTheme();
  const [mode, setMode] = useState<InputMode>("text");
  const [content, setContent] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check for Web Speech API support - lazy initialization
  const [speechSupported] = useState(() => {
    if (typeof window === "undefined") return true;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!SpeechRecognition;
  });

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.max(
        200,
        textareaRef.current.scrollHeight
      )}px`;
    }
  }, [content]);

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
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
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
        setContent((prev) => prev + (prev ? " " : "") + finalTranscript);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setInterimTranscript("");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

    recognition.start();
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      setInterimTranscript("");
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim(), mode);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-[#4A4A4A] mb-3">
          What&apos;s on your mind?
        </h1>
        <p className="text-[#7A7A7A] text-lg">
          Let it all out. No judgment, just listening.
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 bg-white rounded-full p-1.5 shadow-md mb-8 border border-[#F0F0F0]">
        <button
          onClick={() => setMode("text")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all cursor-pointer ${
            mode === "text"
              ? "text-white shadow-sm"
              : "text-[#7A7A7A] hover:bg-[#F5F5F5]"
          }`}
          style={mode === "text" ? { backgroundColor: colors.accent } : {}}
        >
          <MessageSquare size={20} />
          <span>Text</span>
        </button>
        <button
          onClick={() => setMode("voice")}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all cursor-pointer ${
            mode === "voice"
              ? "text-white shadow-sm"
              : "text-[#7A7A7A] hover:bg-[#F5F5F5]"
          }`}
          style={mode === "voice" ? { backgroundColor: colors.accent } : {}}
        >
          <Mic size={20} />
          <span>Voice</span>
        </button>
      </div>

      {/* Input Area */}
      <div className="w-full max-w-2xl">
        {mode === "text" ? (
          <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#F0F0F0]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type here... Let everything out. What happened? How are you feeling? Don't hold back."
              className="w-full min-h-[200px] py-2 px-3 resize-none bg-transparent text-[#4A4A4A] placeholder-[#B0B0B0] focus:outline-none text-lg leading-relaxed"
            />
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F0F0F0]">
              <span className="text-sm text-[#7A7A7A]">
                {content.length} characters
              </span>
              <button
                onClick={handleSubmit}
                disabled={!content.trim()}
                className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer"
                style={{ backgroundColor: colors.accent }}
              >
                Ready to listen
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-lg p-8 border border-[#F0F0F0] text-center">
            {/* Voice Recording UI */}
            <div className="flex flex-col items-center">
              {!speechSupported ? (
                <>
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: "#F0F0F0" }}
                  >
                    <MicOff size={40} className="text-[#7A7A7A]" />
                  </div>
                  <p className="text-[#4A4A4A] font-medium mb-2">
                    Voice input not supported
                  </p>
                  <p className="text-[#7A7A7A] text-sm mb-6">
                    Please use Chrome or Edge for voice features
                  </p>
                  <button
                    onClick={() => setMode("text")}
                    className="flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold transition-all cursor-pointer"
                    style={{ backgroundColor: colors.accent }}
                  >
                    <MessageSquare size={20} />
                    Switch to Text
                  </button>
                </>
              ) : isRecording ? (
                <>
                  <div className="relative mb-6">
                    <div
                      className="w-32 h-32 rounded-full flex items-center justify-center animate-pulse"
                      style={{ backgroundColor: `${colors.accent}20` }}
                    >
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${colors.accent}40` }}
                      >
                        <Mic size={40} style={{ color: colors.accent }} />
                      </div>
                    </div>
                    {/* Recording indicator */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-2xl font-bold text-[#4A4A4A] mb-2">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="text-[#7A7A7A] mb-4">Listening...</p>

                  {/* Live transcription display */}
                  {(content || interimTranscript) && (
                    <div className="w-full max-w-md mb-6 p-4 bg-[#F8F8F8] rounded-xl text-left">
                      <p className="text-[#4A4A4A] text-sm leading-relaxed">
                        {content}
                        {interimTranscript && (
                          <span className="text-[#9A9A9A] italic">
                            {content ? " " : ""}
                            {interimTranscript}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-colors cursor-pointer"
                  >
                    <MicOff size={20} />
                    Stop Recording
                  </button>
                </>
              ) : (
                <>
                  <div
                    className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: `${colors.accent}20` }}
                  >
                    <Mic size={40} style={{ color: colors.accent }} />
                  </div>

                  {/* Show transcribed content if any */}
                  {content ? (
                    <>
                      <div className="w-full max-w-md mb-6 p-4 bg-[#F8F8F8] rounded-xl text-left">
                        <p className="text-[#4A4A4A] text-sm leading-relaxed">
                          {content}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={startRecording}
                          className="flex items-center gap-2 px-6 py-3 border-2 rounded-full font-semibold transition-all cursor-pointer"
                          style={{
                            borderColor: colors.accent,
                            color: colors.accent,
                          }}
                        >
                          <Mic size={18} />
                          Add More
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="flex items-center gap-2 px-6 py-3 text-white rounded-full font-semibold hover:-translate-y-0.5 transition-all cursor-pointer"
                          style={{ backgroundColor: colors.accent }}
                        >
                          Ready to listen
                          <ArrowRight size={18} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-[#7A7A7A] mb-6">
                        Tap to start speaking your thoughts
                      </p>
                      <button
                        onClick={startRecording}
                        className="flex items-center gap-2 px-8 py-4 text-white rounded-full font-semibold hover:-translate-y-0.5 transition-all cursor-pointer"
                        style={{ backgroundColor: colors.accent }}
                      >
                        <Mic size={20} />
                        Start Recording
                      </button>
                    </>
                  )}
                </>
              )}

              {/* Or type instead */}
              <p className="mt-8 text-sm text-[#7A7A7A]">
                Or{" "}
                <button
                  onClick={() => setMode("text")}
                  className="font-medium underline cursor-pointer"
                  style={{ color: colors.accent }}
                >
                  type your thoughts
                </button>{" "}
                instead
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
