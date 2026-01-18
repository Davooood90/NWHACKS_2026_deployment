"use client";

import { useState, useEffect } from "react";
import { Home, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { Message } from "./DialoguePhase";

interface SessionOverviewProps {
  messages: Message[];
  onNewSession: () => void;
}

interface WordData {
  text: string;
  weight: number;
  color: string;
}

export default function SessionOverview({
  messages,
  onNewSession,
}: SessionOverviewProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [keywords, setKeywords] = useState<WordData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Extract keywords and generate summary from messages
  useEffect(() => {
    const generateOverview = async () => {
      setIsLoading(true);

      // Combine all user messages for analysis
      const userContent = messages
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .join(" ");

      // Generate keywords (simple word frequency approach)
      const words = userContent.toLowerCase().split(/\s+/);
      const stopWords = new Set([
        "i",
        "me",
        "my",
        "myself",
        "we",
        "our",
        "ours",
        "you",
        "your",
        "he",
        "she",
        "it",
        "they",
        "what",
        "which",
        "who",
        "this",
        "that",
        "these",
        "those",
        "am",
        "is",
        "are",
        "was",
        "were",
        "be",
        "been",
        "being",
        "have",
        "has",
        "had",
        "do",
        "does",
        "did",
        "will",
        "would",
        "could",
        "should",
        "may",
        "might",
        "must",
        "shall",
        "can",
        "need",
        "dare",
        "ought",
        "used",
        "a",
        "an",
        "the",
        "and",
        "but",
        "if",
        "or",
        "because",
        "as",
        "until",
        "while",
        "of",
        "at",
        "by",
        "for",
        "with",
        "about",
        "against",
        "between",
        "into",
        "through",
        "during",
        "before",
        "after",
        "above",
        "below",
        "to",
        "from",
        "up",
        "down",
        "in",
        "out",
        "on",
        "off",
        "over",
        "under",
        "again",
        "further",
        "then",
        "once",
        "here",
        "there",
        "when",
        "where",
        "why",
        "how",
        "all",
        "each",
        "few",
        "more",
        "most",
        "other",
        "some",
        "such",
        "no",
        "nor",
        "not",
        "only",
        "own",
        "same",
        "so",
        "than",
        "too",
        "very",
        "just",
        "don't",
        "dont",
        "im",
        "i'm",
        "its",
        "it's",
        "really",
        "like",
        "just",
        "get",
        "got",
        "going",
        "go",
        "know",
        "think",
        "want",
        "feel",
        "feeling",
        "thing",
        "things",
        "lot",
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
        colors.accent,
        "#7EC8E3",
        "#B4F8C8",
        "#FBE7C6",
        "#E0BBE4",
        "#FFAEBC",
      ];

      const keywordData: WordData[] = sortedWords.map(([text, count], i) => ({
        text: text.charAt(0).toUpperCase() + text.slice(1),
        weight: Math.max(0.5, count / maxCount),
        color: colorPalette[i % colorPalette.length],
      }));

      setKeywords(keywordData);

      // Generate AI summary
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presetId: "soothing",
            userMessage: `Please provide a brief, compassionate 2-3 sentence summary of what this person shared and how they might be feeling. Here's what they said: "${userContent}"`,
            history: [],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data.text);
        } else {
          setSummary(
            "You took time to reflect and share your thoughts today. That takes courage. Remember, every conversation is a step toward understanding yourself better."
          );
        }
      } catch {
        setSummary(
          "You took time to reflect and share your thoughts today. That takes courage. Remember, every conversation is a step toward understanding yourself better."
        );
      }

      setIsLoading(false);
    };

    generateOverview();
  }, [messages, colors.accent]);

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

      {/* Mood Map / Word Cloud */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mb-6 border border-[#F0F0F0]">
        <h2 className="text-lg font-bold text-[#4A4A4A] mb-6 text-center">
          Your Mood Map
        </h2>
        <div className="flex flex-wrap justify-center items-center gap-3 min-h-[150px]">
          {keywords.length > 0 ? (
            keywords.map((word, index) => (
              <span
                key={index}
                className="px-4 py-2 rounded-full font-medium transition-transform hover:scale-105 cursor-default"
                style={{
                  backgroundColor: `${word.color}25`,
                  color: word.color,
                  fontSize: `${0.875 + word.weight * 0.5}rem`,
                }}
              >
                {word.text}
              </span>
            ))
          ) : (
            <p className="text-[#7A7A7A]">
              Share more to see your mood patterns
            </p>
          )}
        </div>
      </div>

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
        <button
          onClick={onNewSession}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-4 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity cursor-pointer"
          style={{ backgroundColor: colors.accent }}
        >
          Next Steps
          <ArrowRight size={20} />
        </button>
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
