"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Lightbulb,
  MessageSquare,
  CheckCircle,
  Clock,
  Target,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/context/ThemeContext";

interface Conversation {
  id: number;
  title: string | null;
  summary: string | null;
  words: string[] | null;
}

interface ActionStep {
  icon: "message" | "check" | "clock" | "target" | "heart";
  title: string;
  description: string;
  timeframe: string;
}

const iconMap = {
  message: MessageSquare,
  check: CheckCircle,
  clock: Clock,
  target: Target,
  heart: Heart,
};

export default function NextStepsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const { colors } = useTheme();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [actionSteps, setActionSteps] = useState<ActionStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [script, setScript] = useState("");

  useEffect(() => {
    const loadConversationAndGenerateSteps = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      // Load conversation
      const { data: convData } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (!convData) {
        router.push("/dashboard");
        return;
      }

      setConversation(convData);

      // Generate action steps using AI
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId: "Rational",
            userMessage: `Based on this session summary and keywords, generate 3-4 specific, actionable next steps the person can take to improve their situation. Each step should be practical and doable within a week.

Session Summary: "${convData.summary}"
Keywords: ${convData.words?.join(", ") || "general reflection"}

Format your response EXACTLY like this (use these exact labels):
STEP1_TITLE: [short action title]
STEP1_DESC: [1-2 sentence description of the action]
STEP1_TIME: [timeframe like "Today", "This week", "Next few days"]
STEP1_ICON: [one of: message, check, clock, target, heart]

STEP2_TITLE: [short action title]
STEP2_DESC: [1-2 sentence description]
STEP2_TIME: [timeframe]
STEP2_ICON: [icon]

STEP3_TITLE: [short action title]
STEP3_DESC: [1-2 sentence description]
STEP3_TIME: [timeframe]
STEP3_ICON: [icon]

Also provide a short script or talking points if they need to have a conversation:
SCRIPT: [2-3 sentences they could say if approaching someone about the issue]`,
            history: [],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.text;

          // Parse the response
          const steps: ActionStep[] = [];
          for (let i = 1; i <= 4; i++) {
            const titleMatch = text.match(
              new RegExp(`STEP${i}_TITLE:\\s*(.+?)(?=\\n|STEP|SCRIPT|$)`),
            );
            const descMatch = text.match(
              new RegExp(`STEP${i}_DESC:\\s*(.+?)(?=\\n|STEP|SCRIPT|$)`),
            );
            const timeMatch = text.match(
              new RegExp(`STEP${i}_TIME:\\s*(.+?)(?=\\n|STEP|SCRIPT|$)`),
            );
            const iconMatch = text.match(
              new RegExp(`STEP${i}_ICON:\\s*(.+?)(?=\\n|STEP|SCRIPT|$)`),
            );

            if (titleMatch && descMatch) {
              steps.push({
                title: titleMatch[1].trim(),
                description: descMatch[1].trim(),
                timeframe: timeMatch ? timeMatch[1].trim() : "This week",
                icon: (iconMatch?.[1]?.trim() as ActionStep["icon"]) || "check",
              });
            }
          }

          const scriptMatch = text.match(/SCRIPT:\s*([\s\S]+?)$/);
          if (scriptMatch) {
            setScript(scriptMatch[1].trim());
          }

          setActionSteps(
            steps.length > 0
              ? steps
              : [
                  {
                    icon: "heart",
                    title: "Practice Self-Compassion",
                    description:
                      "Take a moment to acknowledge your feelings without judgment.",
                    timeframe: "Today",
                  },
                  {
                    icon: "message",
                    title: "Reach Out",
                    description:
                      "Consider talking to someone you trust about what you're experiencing.",
                    timeframe: "This week",
                  },
                  {
                    icon: "target",
                    title: "Set a Small Goal",
                    description:
                      "Identify one small, achievable action you can take to improve the situation.",
                    timeframe: "Next few days",
                  },
                ],
          );
        }
      } catch (error) {
        console.error("Error generating steps:", error);
        // Fallback steps
        setActionSteps([
          {
            icon: "heart",
            title: "Practice Self-Compassion",
            description:
              "Take a moment to acknowledge your feelings without judgment.",
            timeframe: "Today",
          },
          {
            icon: "message",
            title: "Reach Out",
            description:
              "Consider talking to someone you trust about what you're experiencing.",
            timeframe: "This week",
          },
          {
            icon: "target",
            title: "Set a Small Goal",
            description: "Identify one small, achievable action you can take.",
            timeframe: "Next few days",
          },
        ]);
      }

      setIsLoading(false);
    };

    loadConversationAndGenerateSteps();
  }, [id, router, supabase]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse"
          style={{ backgroundColor: `${colors.accent}30` }}
        >
          <Lightbulb size={32} style={{ color: colors.accent }} />
        </div>
        <p className="text-[#7A7A7A] text-lg">Creating your action plan...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#4A4A4A] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Title Section */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: `${colors.accent}20` }}
          >
            <Lightbulb size={32} style={{ color: colors.accent }} />
          </div>
          <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">
            Your Next Steps
          </h1>
          <p className="text-[#7A7A7A]">
            Actionable steps based on your session:{" "}
            <span className="font-medium">
              {conversation?.title || "Session Reflection"}
            </span>
          </p>
        </div>

        {/* Action Steps */}
        <div className="space-y-4 mb-8">
          {actionSteps.map((step, index) => {
            const IconComponent = iconMap[step.icon] || CheckCircle;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-[#F0F0F0] shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${colors.accent}20` }}
                  >
                    <IconComponent size={24} style={{ color: colors.accent }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[#4A4A4A]">{step.title}</h3>
                      <span className="text-xs text-[#7A7A7A] bg-[#F5F5F5] px-2 py-1 rounded-full">
                        {step.timeframe}
                      </span>
                    </div>
                    <p className="text-sm text-[#6A6A6A]">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Conversation Script */}
        {script && (
          <div className="bg-white rounded-2xl p-6 border border-[#F0F0F0] shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${colors.accent}20` }}
              >
                <MessageSquare size={20} style={{ color: colors.accent }} />
              </div>
              <h3 className="font-bold text-[#4A4A4A]">Conversation Script</h3>
            </div>
            <div className="bg-[#F8F8F8] rounded-xl p-4">
              <p className="text-[#5A5A5A] text-sm leading-relaxed italic">
                &ldquo;{script}&rdquo;
              </p>
            </div>
            <p className="text-xs text-[#7A7A7A] mt-3">
              Use this as a starting point if you need to have a conversation
              about the situation.
            </p>
          </div>
        )}

        {/* Session Keywords */}
        {conversation?.words && conversation.words.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[#F0F0F0] shadow-sm mb-8">
            <h3 className="font-bold text-[#4A4A4A] mb-4">Session Themes</h3>
            <div className="flex flex-wrap gap-2">
              {conversation.words.map((word, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${colors.accent}20`,
                    color: colors.accentDark,
                  }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#4A4A4A] text-white rounded-2xl font-semibold hover:bg-black transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link
            href="/session"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.accent }}
          >
            Start New Session
          </Link>
        </div>
      </main>
    </div>
  );
}
