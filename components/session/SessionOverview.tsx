"use client";

import { useState, useEffect, useRef } from "react";
import { Home, Lightbulb, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { createClient } from "@/lib/supabase/client";
import { Message } from "./DialoguePhase";

interface SessionOverviewProps {
  messages: Message[];
  onNewSession: () => void;
}

interface WordData {
  text: string;
  weight: number;
  color: string;
  bgColor?: string;
}

interface ExtractedTheme {
  type: "theme" | "emotion" | "entity";
  value: string;
}

// Color configurations for different theme types
const THEME_COLORS = {
  theme: { bg: "#7EC8E340", text: "#3A9BC5" },      // Blue for general themes
  emotion: { bg: "#FF8FA330", text: "#E85D75" },    // Pink/Red for emotions
  entity: { bg: "#4FD18B30", text: "#2FB36E" },     // Green for entities
};

export default function SessionOverview({
  messages,
  onNewSession,
}: SessionOverviewProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const supabase = createClient();
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<WordData[]>([]);
  const [extractedThemes, setExtractedThemes] = useState<ExtractedTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const sessionSavedRef = useRef(false);

  // Extract keywords and generate summary from messages
  useEffect(() => {
    const generateOverview = async () => {
      if (sessionSavedRef.current) return;
      sessionSavedRef.current = true;

      setIsLoading(true);

      // Get user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        return;
      }

      // Combine all user messages for analysis
      const userContent = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ");

      // Generate keywords (simple word frequency approach)
      const words = userContent.toLowerCase().split(/\s+/);
      const stopWords = new Set([
        "i", "me", "my", "myself", "we", "our", "ours", "you", "your",
        "he", "she", "it", "they", "what", "which", "who", "this", "that",
        "these", "those", "am", "is", "are", "was", "were", "be", "been",
        "being", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "must", "shall", "can", "need",
        "dare", "ought", "used", "a", "an", "the", "and", "but", "if", "or",
        "because", "as", "until", "while", "of", "at", "by", "for", "with",
        "about", "against", "between", "into", "through", "during", "before",
        "after", "above", "below", "to", "from", "up", "down", "in", "out",
        "on", "off", "over", "under", "again", "further", "then", "once",
        "here", "there", "when", "where", "why", "how", "all", "each", "few",
        "more", "most", "other", "some", "such", "no", "nor", "not", "only",
        "own", "same", "so", "than", "too", "very", "just", "don't", "dont",
        "im", "i'm", "its", "it's", "really", "like", "just", "get", "got",
        "going", "go", "know", "think", "want", "feel", "feeling", "thing",
        "things", "lot", "much", "also", "even", "still", "already", "always",
        "never", "sometimes", "often", "usually", "maybe", "probably",
      ]);

      const wordCounts: Record<string, number> = {};
      words.forEach((word) => {
        const cleaned = word.replace(/[^a-z]/g, "");
        if (cleaned.length > 3 && !stopWords.has(cleaned)) {
          wordCounts[cleaned] = (wordCounts[cleaned] || 0) + 1;
        }
      });

      const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12);

      const maxCount = sortedWords[0]?.[1] || 1;
      const colorPalette = [
        { bg: `${colors.accentLight}50`, text: colors.accentDark },
        { bg: "#7EC8E340", text: "#3A9BC5" },
        { bg: "#4FD18B30", text: "#2FB36E" },
        { bg: "#F5C84230", text: "#D4A82E" },
        { bg: "#E0BBE440", text: "#9B6BA3" },
        { bg: "#FF8FA330", text: "#E85D75" },
      ];

      const keywordData: WordData[] = sortedWords.map(([text, count], i) => ({
        text: text.charAt(0).toUpperCase() + text.slice(1),
        weight: Math.max(0.5, count / maxCount),
        color: colorPalette[i % colorPalette.length].text,
        bgColor: colorPalette[i % colorPalette.length].bg,
      }));

      setKeywords(keywordData);

      // Extract AI-powered themes using Gemini API
      let aiExtractedThemes: ExtractedTheme[] = [];
      try {
        const userMessageContents = messages
          .filter((m) => m.role === "user")
          .map((m) => m.content);

        const themesResponse = await fetch("/api/themes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userMessages: userMessageContents,
          }),
        });

        if (themesResponse.ok) {
          const themesData = await themesResponse.json();
          if (themesData.themes && Array.isArray(themesData.themes)) {
            aiExtractedThemes = themesData.themes.slice(0, 5); // Max 5 themes
            setExtractedThemes(aiExtractedThemes);
          }
        }
      } catch (themeError) {
        console.error("Error extracting themes:", themeError);
        // Fallback: no AI themes extracted
      }

      // Generate AI summary and title
      let generatedSummary = "";
      let generatedTitle = "";

      try {
        // Get summary
        const summaryResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId: "soothing",
            userMessage: `Please provide a brief, compassionate 2-3 sentence summary of what this person shared and how they might be feeling. Here's what they said: "${userContent}"`,
            history: [],
          }),
        });

        if (summaryResponse.ok) {
          const data = await summaryResponse.json();
          generatedSummary = data.text;
        } else {
          generatedSummary =
            "You took time to reflect and share your thoughts today. That takes courage.";
        }

        // Get title
        const titleResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId: "soothing",
            userMessage: `Generate a short 2-4 word title for this conversation. Just the title, nothing else. Here's what they said: "${userContent}"`,
            history: [],
          }),
        });

        if (titleResponse.ok) {
          const data = await titleResponse.json();
          generatedTitle = data.text.replace(/['"]/g, "").trim();
        } else {
          generatedTitle = "Session Reflection";
        }
      } catch {
        generatedSummary =
          "You took time to reflect and share your thoughts today. That takes courage.";
        generatedTitle = "Session Reflection";
      }

      setSummary(generatedSummary);

      // Extract top keywords as plain strings for database
      // Combine AI-extracted themes with frequency-based keywords
      const aiThemeStrings = aiExtractedThemes.map((t) => t.value);
      const frequencyKeywords = sortedWords.slice(0, 6).map(([text]) =>
        text.charAt(0).toUpperCase() + text.slice(1)
      );
      // Prioritize AI themes, then add frequency keywords (deduped)
      const keywordStrings = [...new Set([...aiThemeStrings, ...frequencyKeywords])].slice(0, 6);

      // Save session to database
      try {
        const { data: conversationData, error: conversationError } = await supabase
          .from("conversations")
          .insert({
            user_id: session.user.id,
            title: generatedTitle,
            summary: generatedSummary,
            words: keywordStrings,
          })
          .select()
          .single();

        if (conversationError) {
          console.error("Error saving conversation:", conversationError);
        } else if (conversationData) {
          setConversationId(conversationData.id);
          // Save/update themes
          for (const keyword of keywordStrings.slice(0, 4)) {
            // Check if theme exists for this user
            const { data: existingTheme } = await supabase
              .from("themes")
              .select("id, count")
              .eq("user_id", session.user.id)
              .eq("label", keyword)
              .single();

            if (existingTheme) {
              // Update count
              await supabase
                .from("themes")
                .update({ count: existingTheme.count + 1 })
                .eq("id", existingTheme.id);

              // Link to conversation
              await supabase.from("conversations_to_theme").insert({
                conversation_id: conversationData.id,
                theme_id: existingTheme.id,
              });
            } else {
              // Create new theme
              const { data: newTheme } = await supabase
                .from("themes")
                .insert({
                  user_id: session.user.id,
                  label: keyword,
                  count: 1,
                })
                .select()
                .single();

              if (newTheme) {
                // Link to conversation
                await supabase.from("conversations_to_theme").insert({
                  conversation_id: conversationData.id,
                  theme_id: newTheme.id,
                });
              }
            }
          }
        }
      } catch (error) {
        console.error("Error saving session:", error);
      }

      setIsLoading(false);
    };

    generateOverview();
  }, [messages, colors.accentDark, colors.accentLight, supabase]);

  const handleReturnHome = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh]"
        style={{ backgroundColor: colors.bg }}
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-pulse"
          style={{ backgroundColor: `${colors.accent}30` }}
        >
          <Sparkles size={32} style={{ color: colors.accent }} />
        </div>
        <p className="text-[#7A7A7A] text-lg">
          Reflecting on your session...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-10">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: `${colors.accent}20` }}
        >
          <Sparkles size={32} style={{ color: colors.accent }} />
        </div>
        <h1 className="text-3xl font-bold text-[#4A4A4A] mb-2">
          Session Complete
        </h1>
        <p className="text-[#7A7A7A]">Here&apos;s what we explored together</p>
      </div>

      {/* Key Themes Section */}
      {extractedThemes.length > 0 && (
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-[#F0F0F0]">
          <h2 className="text-lg font-bold text-[#4A4A4A] mb-4 text-center">
            Key Themes
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-3">
            {extractedThemes.map((theme, index) => (
              <div
                key={index}
                className="px-4 py-2 rounded-full font-semibold transition-transform hover:scale-105 cursor-default shadow-sm flex items-center gap-2"
                style={{
                  backgroundColor: THEME_COLORS[theme.type].bg,
                  color: THEME_COLORS[theme.type].text,
                }}
              >
                <span className="text-xs opacity-70 uppercase">
                  {theme.type === "theme" ? "Theme" : theme.type === "emotion" ? "Emotion" : "Entity"}
                </span>
                <span>{theme.value}</span>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-[#7A7A7A]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME_COLORS.theme.bg, border: `1px solid ${THEME_COLORS.theme.text}` }} />
              <span>General</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME_COLORS.emotion.bg, border: `1px solid ${THEME_COLORS.emotion.text}` }} />
              <span>Emotion</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEME_COLORS.entity.bg, border: `1px solid ${THEME_COLORS.entity.text}` }} />
              <span>Entity</span>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-8 border border-[#F0F0F0]">
        <h2 className="text-lg font-bold text-[#4A4A4A] mb-4">Summary</h2>
        <p className="text-[#5A5A5A] leading-relaxed">{summary}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleReturnHome}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-[#4A4A4A] text-white rounded-2xl font-semibold hover:bg-black transition-colors cursor-pointer"
        >
          <Home size={20} />
          Return Home
        </button>
        {conversationId ? (
          <Link
            href={`/next-steps/${conversationId}`}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: colors.accent }}
          >
            <Lightbulb size={20} />
            Next Steps
          </Link>
        ) : (
          <button
            onClick={onNewSession}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: colors.accent }}
          >
            <Lightbulb size={20} />
            New Session
          </button>
        )}
      </div>

      {/* Session Stats */}
      <div className="mt-8 text-center">
        <p className="text-sm text-[#9A9A9A]">
          Session duration: {messages.length} exchanges
        </p>
      </div>
    </div>
  );
}
