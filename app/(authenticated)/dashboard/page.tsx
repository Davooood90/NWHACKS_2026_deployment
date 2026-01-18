"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, Sparkles, Lightbulb } from "lucide-react";
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

const themeColors = [
  "#5BB5D5",
  "#4FD18B",
  "#FF8FA3",
  "#F5C842",
  "#9B6BA3",
  "#E85D75",
];

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
  const [moodData, setMoodData] = useState<{ day: string; value: number }[]>(
    [],
  );
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
      const { data: allConvData } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (allConvData) {
        setConversations(allConvData.slice(0, 5));

        // Generate mood data from conversations
        const last7Days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const today = new Date();
        const dayOfWeek = today.getDay();

        const reorderedDays = [
          ...last7Days.slice((dayOfWeek + 1) % 7),
          ...last7Days.slice(0, (dayOfWeek + 1) % 7),
        ];

        // Initialize counts map
        const activityByDay: Record<string, number> = {};
        reorderedDays.forEach((day) => (activityByDay[day] = 0));

        // Calculate date 7 days ago to filter old data
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6); // -6 ensures we include today + 6 previous days
        sevenDaysAgo.setHours(0, 0, 0, 0);

        allConvData.forEach((conv) => {
          const convDate = new Date(conv.created_at);

          // Only count if the conversation happened in the last 7 days
          if (convDate >= sevenDaysAgo) {
            const convDay = last7Days[convDate.getDay()];
            // Increment the count for that day
            if (activityByDay[convDay] !== undefined) {
              activityByDay[convDay] += 1;
            }
          }
        });

        const chartData = reorderedDays.map((day) => ({
          day,
          value: activityByDay[day],
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

  // Chart calculations
  const chartMoodData =
    moodData.length > 0
      ? moodData
      : [
          { day: "Mon", value: 100 },
          { day: "Tue", value: 100 },
          { day: "Wed", value: 100 },
          { day: "Thu", value: 100 },
          { day: "Fri", value: 100 },
          { day: "Sat", value: 100 },
          { day: "Sun", value: 100 },
        ];

  const rawMax = Math.max(...chartMoodData.map((d) => d.value));
  const maxValue = rawMax < 4 ? 4 : rawMax;

  // 2. Determine Y-Axis Ticks (Grid lines)
  // If max is small (e.g. 4), show 0, 1, 2, 3, 4. If large, show 5 steps.
  let yTicks: number[] = [];
  if (maxValue <= 5) {
    yTicks = Array.from({ length: maxValue + 1 }, (_, i) => i);
  } else {
    // Create 5 roughly even steps
    const step = Math.ceil(maxValue / 4);
    yTicks = [0, step, step * 2, step * 3, step * 4];
    // Update max value to match the top tick so the line doesn't go off chart
    // (This is optional, but makes the top line the true ceiling)
  }
  const displayMax = yTicks[yTicks.length - 1];

  // 3. Dimensions
  const chartWidth = 280;
  const chartHeight = 180;
  const paddingLeft = 35; // Increased for Y-axis labels
  const paddingRight = 10;
  const paddingY = 20; // Top/Bottom padding
  const labelHeight = 20;

  const graphWidth = chartWidth - paddingLeft - paddingRight;
  const graphHeight = chartHeight - paddingY * 2 - labelHeight;

  // 4. Map Points
  const points = chartMoodData.map((d, i) => ({
    x: paddingLeft + (i / (chartMoodData.length - 1)) * graphWidth,
    y: paddingY + graphHeight - (d.value / displayMax) * graphHeight,
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#4A4A4A]">
              Welcome Back,{" "}
              <span className="relative inline-block">
                {userName}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Mood Chart */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] shadow-sm min-h-[240px]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[#4A4A4A]">Your Activity</h2>
              <span className="text-xs text-[#7A7A7A]">7 days</span>
            </div>

            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id={`gradient-${colors.accent.replace("#", "")}`}
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor={colors.accent} />
                  <stop
                    offset="100%"
                    stopColor={colors.accent}
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Lines & Labels */}
              {yTicks.map((tick) => {
                const yPos =
                  paddingY + graphHeight - (tick / displayMax) * graphHeight;
                return (
                  <g key={tick}>
                    {/* Horizontal Grid Line */}
                    <line
                      x1={paddingLeft}
                      y1={yPos}
                      x2={chartWidth - paddingRight}
                      y2={yPos}
                      stroke="#F0F0F0"
                      strokeWidth="1"
                      strokeDasharray={tick === 0 ? "" : "4 4"} // Dashed for non-zero
                    />
                    {/* Y-Axis Label */}
                    <text
                      x={paddingLeft - 10}
                      y={yPos + 4} // Optical vertical alignment
                      textAnchor="end"
                      className="text-[12px] fill-[#A0A0A0]"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* The Area Fill (Gradient) */}
              <path
                d={`${linePath} L ${chartWidth - paddingRight} ${paddingY + graphHeight} L ${paddingLeft} ${paddingY + graphHeight} Z`}
                fill={`url(#gradient-${colors.accent.replace("#", "")})`}
                opacity="0.3"
              />

              {/* The Line Stroke */}
              <path
                d={linePath}
                fill="none"
                stroke={colors.accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* The Dots */}
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

              {/* X-Axis Labels */}
              {chartMoodData.map((d, i) => (
                <text
                  key={d.day}
                  x={
                    paddingLeft + (i / (chartMoodData.length - 1)) * graphWidth
                  }
                  y={chartHeight - 5}
                  textAnchor="middle"
                  className="text-[12px] fill-[#7A7A7A]"
                >
                  {d.day}
                </text>
              ))}
            </svg>
          </div>

          {/* Top Themes */}
          <div className="bg-white rounded-2xl p-5 border border-[#F0F0F0] shadow-sm min-h-[240px]">
            <h2 className="font-bold text-[#4A4A4A] mb-4">Your Top Themes</h2>
            <div className="space-y-3">
              {themes.length > 0 ? (
                themes.slice(0, 5).map((theme, index) => (
                  <div key={theme.id} className="flex items-center gap-3">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          themeColors[index % themeColors.length],
                      }}
                    />
                    <span className="flex-1 text-sm text-[#4A4A4A] font-medium">
                      {theme.label}
                    </span>
                    <span className="text-xs text-[#7A7A7A] bg-[#F5F5F5] px-2 py-0.5 rounded-full">
                      {theme.count}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-[#7A7A7A] text-sm text-center py-4">
                  Complete a session to see themes
                </p>
              )}
            </div>
          </div>

          {/* Quick Check-in */}
          <Link
            href="/session"
            className="bg-gradient-to-br from-white to-[#FAFAFA] rounded-2xl p-5 border border-[#F0F0F0] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all min-h-[240px]"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: colors.accent }}
            >
              <Sparkles size={24} className="text-white" />
            </div>
            <h3 className="font-bold text-[#4A4A4A] mb-1">Quick Check-in</h3>
            <p className="text-sm text-[#7A7A7A]">
              How are you feeling right now? Take a moment to reflect.
            </p>
          </Link>
        </div>

        {/* Past Sessions Section */}
        <div className="border-t border-[#E0E0E0] pt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#4A4A4A]">Past Sessions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="bg-white rounded-2xl p-5 border border-[#F0F0F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                <p className="text-xs text-[#7A7A7A] mb-1">
                  {formatDate(conversation.created_at)}
                </p>
                <h3 className="text-lg font-bold text-[#4A4A4A] mb-2">
                  {conversation.title || "Session Reflection"}
                </h3>

                <p className="text-sm text-[#7A7A7A] mb-4 line-clamp-2">
                  {conversation.summary ||
                    "A moment of reflection and clarity."}
                </p>

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

                <Link
                  href={`/next-steps/${conversation.id}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all cursor-pointer text-white"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Lightbulb size={16} />
                  Next Steps
                </Link>
              </div>
            ))}

            {/* Empty State Card */}
            <Link
              href="/session"
              className="bg-white rounded-2xl p-5 border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center min-h-[220px] hover:border-[#7EC8E3] transition-colors cursor-pointer group"
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-[#7A7A7A] group-hover:text-white transition-colors"
                style={{
                  backgroundColor: "#F5F5F5",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#F5F5F5";
                }}
              >
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
