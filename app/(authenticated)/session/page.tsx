"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import InitialInput from "@/components/session/InitialInput";
import DialoguePhase, { Message } from "@/components/session/DialoguePhase";
import SessionOverview from "@/components/session/SessionOverview";

type SessionPhase = "input" | "dialogue" | "overview";
type InputMode = "text" | "voice";

export default function SessionPage() {
  const router = useRouter();
  const supabase = createClient();
  const { colors } = useTheme();
  const [phase, setPhase] = useState<SessionPhase>("input");
  const [initialContent, setInitialContent] = useState("");
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [presetId, setPresetId] = useState("soothing");

  // Check authentication and load user preferences
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Load user's AI personality preference
      const { data: preferences } = await supabase
        .from("preferences")
        .select("ai_personality")
        .eq("user_id", session.user.id)
        .single();

      if (preferences?.ai_personality) {
        // Map personality to preset ID
        const personalityMap: Record<string, string> = {
          soothing: "soothing",
          clear: "Rational",
          bubbly: "Bubbly",
        };
        setPresetId(
          personalityMap[preferences.ai_personality] || "soothing"
        );
      }

      setLoading(false);
    };

    init();
  }, [router, supabase]);

  const handleInitialSubmit = (content: string, mode: InputMode) => {
    setInitialContent(content);
    setInputMode(mode);
    setPhase("dialogue");
  };

  const handleDialogueComplete = (messages: Message[]) => {
    setSessionMessages(messages);
    setPhase("overview");
  };

  const handleNewSession = () => {
    setPhase("input");
    setInitialContent("");
    setSessionMessages([]);
  };

  const handleExit = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="animate-pulse text-2xl text-[#7A7A7A]">
          Preparing your space...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left - Back/Logo */}
          <div className="flex items-center gap-4">
            {phase !== "input" ? (
              <button
                onClick={() =>
                  phase === "dialogue"
                    ? setPhase("input")
                    : setPhase("dialogue")
                }
                className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#4A4A4A] transition-colors cursor-pointer"
              >
                <ArrowLeft size={20} />
                <span className="font-medium hidden sm:inline">Back</span>
              </button>
            ) : (
              <Link
                href="/dashboard"
                className="flex items-center gap-2"
              >
                <Image
                  src="/icon.svg"
                  alt="Rambl"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
                <span className="text-xl font-bold text-[#4A4A4A]">rambl</span>
              </Link>
            )}
          </div>

          {/* Center - Phase Indicator */}
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                phase === "input" ? "" : "opacity-30"
              }`}
              style={{
                backgroundColor:
                  phase === "input" ? colors.accent : "#7A7A7A",
              }}
            />
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                phase === "dialogue" ? "" : "opacity-30"
              }`}
              style={{
                backgroundColor:
                  phase === "dialogue" ? colors.accent : "#7A7A7A",
              }}
            />
            <div
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                phase === "overview" ? "" : "opacity-30"
              }`}
              style={{
                backgroundColor:
                  phase === "overview" ? colors.accent : "#7A7A7A",
              }}
            />
          </div>

          {/* Right - Exit */}
          <button
            onClick={handleExit}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
            title="Exit session"
          >
            <X size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative py-8">
        {/* Background decorative elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute -top-20 -left-20 w-64 h-64 rounded-full opacity-10 blur-3xl"
            style={{ backgroundColor: colors.accent }}
          />
          <div className="absolute top-40 -right-10 w-48 h-48 bg-[#B4F8C8] opacity-10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-10 w-32 h-32 bg-[#E0BBE4] opacity-10 rounded-full blur-3xl" />
        </div>

        {/* Phase Content */}
        <div className="relative z-10">
          {phase === "input" && (
            <InitialInput onSubmit={handleInitialSubmit} />
          )}

          {phase === "dialogue" && (
            <DialoguePhase
              initialMessage={initialContent}
              presetId={presetId}
              onComplete={handleDialogueComplete}
            />
          )}

          {phase === "overview" && (
            <SessionOverview
              messages={sessionMessages}
              onNewSession={handleNewSession}
            />
          )}
        </div>
      </main>
    </div>
  );
}
