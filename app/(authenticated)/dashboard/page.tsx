"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useTheme } from "@/context/ThemeContext";

interface Conversation {
  id: number;
  created_at: string;
  title: string | null;
  summary: string | null;
  words: string[] | null;
  intensity_score: number | null;
}

interface Theme {
  id: number;
  label: string;
  count: number;
}

const themeColors = ["#5BB5D5", "#4FD18B", "#FF8FA3", "#F5C842", "#9B6BA3", "#E85D75"];

const getMoodIcon = (intensity: number | null) => {
  if (intensity === null) return "😊";
  if (intensity >= 70) return "😊";
  if (intensity >= 40) return "😐";
  return "😔";
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [moodData, setMoodData] = useState<{ day: string; value: number }[]>([]);
  const supabase = createClient();
  const { colors } = useTheme();

  useEffect(() => {
    const loadDashboard = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setIsAuthenticated(true);
      const name =
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "User";
      setUserName(name);

      // Load conversations
      const { data: conversationsData } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (conversationsData) {
        setConversations(conversationsData);

        // Generate mood data from last 7 conversations
        const last7Days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const today = new Date();
        const dayOfWeek = today.getDay();

        // Reorder days to end with today
        const reorderedDays = [
          ...last7Days.slice(dayOfWeek),
          ...last7Days.slice(0, dayOfWeek),
        ];

        // Get conversations from last 7 days and map to intensity
        const moodByDay: Record<string, number[]> = {};
        reorderedDays.forEach((day) => (moodByDay[day] = []));

        conversationsData.forEach((conv) => {
          const convDate = new Date(conv.created_at);
          const convDay = last7Days[convDate.getDay()];
          if (conv.intensity_score !== null && moodByDay[convDay]) {
            moodByDay[convDay].push(conv.intensity_score);
          }
        });

        const chartData = reorderedDays.map((day) => ({
          day,
          value:
            moodByDay[day].length > 0
              ? Math.round(
                  moodByDay[day].reduce((a, b) => a + b, 0) / moodByDay[day].length
                )
              : 50, // Default to 50 if no data
        }));

        setMoodData(chartData);
      }

      // Load themes
      const { data: themesData } = await supabase
        .from("themes")
        .select("*")
        .eq("user_id", session.user.id)
        .order("count", { ascending: false })
        .limit(6);

      if (themesData) {
        setThemes(themesData);
      }

      setLoading(false);
    };

    loadDashboard();
  }, [router, supabase]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="animate-pulse text-2xl text-[#7A7A7A]">
          Loading your rambles...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Calculate path for the mood line chart
  const chartMoodData = moodData.length > 0 ? moodData : [
    { day: "Mon", value: 50 },
    { day: "Tue", value: 50 },
    { day: "Wed", value: 50 },
    { day: "Thu", value: 50 },
    { day: "Fri", value: 50 },
    { day: "Sat", value: 50 },
    { day: "Sun", value: 50 },
  ];

  const maxValue = Math.max(...chartMoodData.map((d) => d.value), 1);
  const chartWidth = 100;
  const chartHeight = 60;
  const points = chartMoodData.map((d, i) => ({
    x: (i / (chartMoodData.length - 1)) * chartWidth,
    y: chartHeight - (d.value / maxValue) * chartHeight,
  }));
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: colors.bg }}
    >
      <DashboardNavbar />

      {/* Main Content */}
      <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#4A4A4A]">
              Welcome Back,{" "}
              <span className="relative inline-block">
                {userName}
                {/* Wavy underline */}
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  height="8"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 4 Q 12.5 0, 25 4 T 50 4 T 75 4 T 100 4"
                    fill="none"
                    stroke={colors.accent}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-[#7A7A7A] mt-3">
              Track your thoughts, discover patterns, grow mindfully.
            </p>
          </div>

          <Link
            href="/session"
            className="mt-6 md:mt-0 px-6 py-3 bg-[#4A4A4A] text-white font-semibold rounded-xl hover:bg-black hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer shadow-lg"
          >
            <Plus size={20} />
            New Session
          </Link>
        </div>

        {/* Insights & Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Mood Intensity Graph */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#F0F0F0] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#4A4A4A]">
                Mood Intensity
              </h2>
              <span className="text-sm text-[#7A7A7A]">Last 7 days</span>
            </div>

            {/* Chart */}
            <div className="h-48 relative">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + 20}`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={chartHeight - (y / 100) * chartHeight}
                    x2={chartWidth}
                    y2={chartHeight - (y / 100) * chartHeight}
                    stroke="#F0F0F0"
                    strokeWidth="0.5"
                  />
                ))}

                {/* Area under the line */}
                <path
                  d={`${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                  fill={`url(#gradient-${colors.accent.replace("#", "")})`}
                  opacity="0.3"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient
                    id={`gradient-${colors.accent.replace("#", "")}`}
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor={colors.accent} />
                    <stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data points */}
                {points.map((p, i) => (
                  <circle
                    key={i}
                    cx={p.x}
                    cy={p.y}
                    r="3"
                    fill="white"
                    stroke={colors.accent}
                    strokeWidth="2"
                  />
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                {chartMoodData.map((d) => (
                  <span key={d.day} className="text-xs text-[#7A7A7A]">
                    {d.day}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recurring Themes */}
          <div className="bg-white rounded-2xl p-6 border border-[#F0F0F0] shadow-sm">
            <h2 className="text-lg font-bold text-[#4A4A4A] mb-6">
              Recurring Themes
            </h2>

            <div className="space-y-4">
              {themes.length > 0 ? (
                themes.map((theme, index) => (
                  <div key={theme.id} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: themeColors[index % themeColors.length] }}
                    />
                    <span className="flex-1 text-[#4A4A4A] font-medium">
                      {theme.label}
                    </span>
                    <span className="text-sm text-[#7A7A7A] bg-[#F5F5F5] px-2 py-1 rounded-full">
                      {theme.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[#7A7A7A] text-sm text-center py-4">
                  Complete a session to see your themes
                </p>
              )}
            </div>

            {themes.length > 0 && (
              <button className="mt-6 w-full py-2 text-sm font-medium hover:underline cursor-pointer" style={{ color: colors.accent }}>
                View all themes →
              </button>
            )}
          </div>
        </div>

        {/* Past Sessions Section */}
        <div className="border-t border-[#E0E0E0] pt-8">
          <h2 className="text-xl font-bold text-[#4A4A4A] mb-6">
            Past Sessions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Session Cards */}
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white rounded-2xl p-5 border border-[#F0F0F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                {/* Mood Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: colors.bg }}
                >
                  {getMoodIcon(conversation.intensity_score)}
                </div>

                {/* Metadata */}
                <p className="text-xs text-[#7A7A7A] mb-1">
                  {formatDate(conversation.created_at)}
                </p>
                <h3 className="text-lg font-bold text-[#4A4A4A] mb-2">
                  {conversation.title || "Session Reflection"}
                </h3>

                {/* Summary */}
                <p className="text-sm text-[#7A7A7A] mb-4 line-clamp-2">
                  {conversation.summary || "A moment of reflection and clarity."}
                </p>

                {/* Keywords */}
                {conversation.words && conversation.words.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {conversation.words.slice(0, 3).map((word, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: `${themeColors[i % themeColors.length]}20`,
                          color: themeColors[i % themeColors.length],
                        }}
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                )}

                {/* View Button */}
                <button
                  className="px-4 py-2 bg-[#F5F5F5] text-[#4A4A4A] text-sm font-medium rounded-lg hover:text-white transition-colors cursor-pointer"
                  style={{
                    ["--hover-bg" as string]: colors.accent,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent;
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#F5F5F5";
                    e.currentTarget.style.color = "#4A4A4A";
                  }}
                >
                  View
                </button>
              </div>
            ))}

            {/* Empty State Card */}
            <Link
              href="/session"
              className="bg-white rounded-2xl p-5 border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center min-h-[220px] hover:border-[#7EC8E3] transition-colors cursor-pointer group"
            >
              <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center text-[#7A7A7A] group-hover:text-white transition-colors" style={{ ["--group-hover-bg" as string]: colors.accent }}>
                <Plus size={24} />
              </div>
              <p className="mt-3 text-sm text-[#7A7A7A] font-medium">
                Start a new session
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
