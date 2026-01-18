"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import { useTheme } from "@/context/ThemeContext";

// Mock data for the mood chart
const moodData = [
  { day: "Mon", value: 65 },
  { day: "Tue", value: 80 },
  { day: "Wed", value: 45 },
  { day: "Thu", value: 70 },
  { day: "Fri", value: 85 },
  { day: "Sat", value: 60 },
  { day: "Sun", value: 75 },
];

// Mock data for recurring themes
const themes = [
  { name: "Work", count: 12, color: "#7EC8E3" },
  { name: "Sleep", count: 8, color: "#B4F8C8" },
  { name: "Social", count: 5, color: "#FFAEBC" },
  { name: "Health", count: 4, color: "#FBE7C6" },
];

// Mock data for past sessions
const pastSessions = [
  {
    id: 1,
    mood: "happy",
    date: "Jan 15, 2026",
    title: "Morning Reflection",
    summary:
      "Felt energized after a good night's sleep. Discussed goals for the week ahead.",
  },
  {
    id: 2,
    mood: "neutral",
    date: "Jan 14, 2026",
    title: "Work Stress",
    summary:
      "Talked through challenges at work. Found some clarity on next steps.",
  },
  {
    id: 3,
    mood: "sad",
    date: "Jan 13, 2026",
    title: "Evening Thoughts",
    summary: "Processed some difficult emotions. Feeling better after venting.",
  },
  {
    id: 4,
    mood: "happy",
    date: "Jan 12, 2026",
    title: "Weekend Plans",
    summary: "Excited about upcoming trip. Made a list of things to pack.",
  },
];

const getMoodIcon = (mood: string) => {
  switch (mood) {
    case "happy":
      return "😊";
    case "neutral":
      return "😐";
    case "sad":
      return "😔";
    default:
      return "😊";
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const supabase = createClient();
  const { colors } = useTheme();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
        const name =
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "User";
        setUserName(name);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase.auth]);

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
  const maxValue = Math.max(...moodData.map((d) => d.value));
  const chartWidth = 100;
  const chartHeight = 60;
  const points = moodData.map((d, i) => ({
    x: (i / (moodData.length - 1)) * chartWidth,
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

          <button className="mt-6 md:mt-0 px-6 py-3 bg-[#4A4A4A] text-white font-semibold rounded-xl hover:bg-black hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer shadow-lg">
            <Plus size={20} />
            New Session
          </button>
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
                  fill="url(#gradient)"
                  opacity="0.3"
                />

                {/* Gradient definition */}
                <defs>
                  <linearGradient
                    id="gradient"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#7EC8E3" />
                    <stop offset="100%" stopColor="#7EC8E3" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#7EC8E3"
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
                    stroke="#7EC8E3"
                    strokeWidth="2"
                  />
                ))}
              </svg>

              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                {moodData.map((d) => (
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
              {themes.map((theme) => (
                <div key={theme.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span className="flex-1 text-[#4A4A4A] font-medium">
                    {theme.name}
                  </span>
                  <span className="text-sm text-[#7A7A7A] bg-[#F5F5F5] px-2 py-1 rounded-full">
                    {theme.count}
                  </span>
                </div>
              ))}
            </div>

            <button className="mt-6 w-full py-2 text-sm text-[#7EC8E3] font-medium hover:underline cursor-pointer">
              View all themes →
            </button>
          </div>
        </div>

        {/* Past Sessions Section */}
        <div className="border-t border-[#E0E0E0] pt-8">
          <h2 className="text-xl font-bold text-[#4A4A4A] mb-6">
            Past Sessions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Session Cards */}
            {pastSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-2xl p-5 border border-[#F0F0F0] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
              >
                {/* Mood Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: colors.bg }}
                >
                  {getMoodIcon(session.mood)}
                </div>

                {/* Metadata */}
                <p className="text-xs text-[#7A7A7A] mb-1">{session.date}</p>
                <h3 className="text-lg font-bold text-[#4A4A4A] mb-2">
                  {session.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-[#7A7A7A] mb-4 line-clamp-2">
                  {session.summary}
                </p>

                {/* Learn Button */}
                <button className="px-4 py-2 bg-[#F5F5F5] text-[#4A4A4A] text-sm font-medium rounded-lg hover:bg-[#7EC8E3] hover:text-white transition-colors cursor-pointer">
                  Learn
                </button>
              </div>
            ))}

            {/* Empty State Card */}
            <div className="bg-white rounded-2xl p-5 border-2 border-dashed border-[#E0E0E0] flex flex-col items-center justify-center min-h-[220px] hover:border-[#7EC8E3] transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-[#F5F5F5] rounded-full flex items-center justify-center text-[#7A7A7A] group-hover:bg-[#7EC8E3] group-hover:text-white transition-colors">
                <Plus size={24} />
              </div>
              <p className="mt-3 text-sm text-[#7A7A7A] font-medium">
                Start a new session
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
