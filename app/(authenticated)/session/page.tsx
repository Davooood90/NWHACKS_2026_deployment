"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";
import InitialInput from "@/components/session/InitialInput";
import DialoguePhase, { Message } from "@/components/session/DialoguePhase";
import SessionOverview from "@/components/session/SessionOverview";
import { ValidationDepthType, ActionStyleType } from "@/lib/prompts";

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
  const [validationDepth, setValidationDepth] =
    useState<ValidationDepthType>("concise");
  const [actionStyle, setActionStyle] = useState<ActionStyleType>("gentle");

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
        .select("ai_personality, ai_style, ai_action")
        .eq("user_id", session.user.id)
        .single();

      if (preferences) {
        const personalityMap: Record<string, string> = {
          soothing: "soothing",
          clear: "Rational",
          bubbly: "Bubbly",
        };
        setPresetId(personalityMap[preferences.ai_personality] || "soothing");

        if (preferences.ai_style) setValidationDepth(preferences.ai_style);
        if (preferences.ai_action) setActionStyle(preferences.ai_action);
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
              <Link href="/dashboard" className="flex items-center gap-2">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 52 52"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-7 h-7"
                >
                  <rect width="52" height="52" rx="7" fill={colors.accent} />
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
                backgroundColor: phase === "input" ? colors.accent : "#7A7A7A",
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
          {phase === "input" && <InitialInput onSubmit={handleInitialSubmit} />}

          {phase === "dialogue" && (
            <DialoguePhase
              initialMessage={initialContent}
              presetId={presetId}
              depth={validationDepth}
              action={actionStyle}
              inputMode={inputMode}
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
