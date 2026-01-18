"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Heart,
  Zap,
  Sparkles,
  Flower2,
  ArrowLeft,
  LogOut,
  Camera,
  Check,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme, ThemeType, themeColors } from "@/context/ThemeContext";

type TabType = "ai-config" | "profile" | "background";
type PersonalityType = "soothing" | "clear" | "bubbly";
type ValidationDepthType = "concise" | "deep";
type ActionStyleType = "gentle" | "direct";

const personalities = [
  {
    id: "soothing" as PersonalityType,
    name: "Soothing",
    icon: Heart,
    description: "Soft, calm, reassuring",
    color: "#FFAEBC",
  },
  {
    id: "clear" as PersonalityType,
    name: "Clear",
    icon: Zap,
    description: "Honest, logical",
    color: "#7EC8E3",
  },
  {
    id: "bubbly" as PersonalityType,
    name: "Bubbly",
    icon: Sparkles,
    description: "High energy",
    color: "#FBE7C6",
  },
];

const themes: { id: ThemeType; name: string }[] = [
  { id: "classic", name: "Classic" },
  { id: "soft-blue", name: "Soft Blue" },
  { id: "lemon", name: "Lemon" },
  { id: "mint", name: "Mint" },
];

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme: selectedTheme, setTheme: setSelectedTheme, colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("ai-config");
  const [userId, setUserId] = useState<string | null>(null);

  // AI Config state
  const [personality, setPersonality] = useState<PersonalityType>("soothing");
  const [validationDepth, setValidationDepth] =
    useState<ValidationDepthType>("concise");
  const [actionStyle, setActionStyle] = useState<ActionStyleType>("gentle");

  // Profile state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userInitial, setUserInitial] = useState("A");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Load user and preferences
  useEffect(() => {
    const loadUserAndPreferences = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUserId(session.user.id);
      const name =
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "User";
      setUserName(name);
      setUserEmail(session.user.email || "");
      setUserInitial(name.charAt(0).toUpperCase());

      // Load preferences from database
      const { data: preferences } = await supabase
        .from("preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (preferences) {
        setPersonality(preferences.ai_personality as PersonalityType);
        setValidationDepth(preferences.ai_style as ValidationDepthType);
        setActionStyle(preferences.ai_action as ActionStyleType);
        setSelectedTheme(
          (preferences.background_colour as ThemeType) || "classic"
        );
      }

      setLoading(false);
    };

    loadUserAndPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save preferences to database
  const savePreferences = useCallback(
    async (
      newPersonality: PersonalityType,
      newStyle: ValidationDepthType,
      newAction: ActionStyleType,
      newTheme: ThemeType
    ) => {
      if (!userId) return;

      setSaving(true);
      setSaveSuccess(false);

      const { error } = await supabase.from("preferences").upsert(
        {
          user_id: userId,
          ai_personality: newPersonality,
          ai_style: newStyle,
          ai_action: newAction,
          background_colour: newTheme,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        }
      );

      setSaving(false);

      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    },
    [userId, supabase]
  );

  // Handle personality change
  const handlePersonalityChange = (newPersonality: PersonalityType) => {
    setPersonality(newPersonality);
    savePreferences(newPersonality, validationDepth, actionStyle, selectedTheme);
  };

  // Handle validation depth change
  const handleValidationDepthChange = (newDepth: ValidationDepthType) => {
    setValidationDepth(newDepth);
    savePreferences(personality, newDepth, actionStyle, selectedTheme);
  };

  // Handle action style change
  const handleActionStyleChange = (newAction: ActionStyleType) => {
    setActionStyle(newAction);
    savePreferences(personality, validationDepth, newAction, selectedTheme);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    savePreferences(personality, validationDepth, actionStyle, newTheme);
  };

  // Save profile (name) to Supabase auth
  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileSaveSuccess(false);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: userName },
    });

    setProfileSaving(false);

    if (!error) {
      setUserInitial(userName.charAt(0).toUpperCase());
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getPersonalityText = () => {
    const p = personalities.find((p) => p.id === personality);
    return p?.description.toLowerCase() || "calm and reassuring";
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.bg }}
      >
        <div className="animate-pulse text-2xl text-[#7A7A7A]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Back Button */}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#4A4A4A] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Save Status Indicator */}
            {saving && (
              <div className="flex items-center gap-2 text-[#7A7A7A] text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Check size={16} />
                <span>Saved!</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
              title="Log out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            <Flower2 size={24} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#4A4A4A]">
            Tailor Your Experience
          </h1>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-3 mb-10">
          {/* User Initial Badge */}
          <div className="w-10 h-10 rounded-full bg-[#7EC8E3] flex items-center justify-center">
            <span className="text-white font-bold text-sm">{userInitial}</span>
          </div>

          {/* Tab Buttons */}
          <div className="flex gap-2 bg-[#F5F5F5] p-1.5 rounded-full">
            <button
              onClick={() => setActiveTab("ai-config")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === "ai-config"
                  ? "bg-white text-[#4A4A4A] shadow-sm"
                  : "text-[#7A7A7A] hover:text-[#4A4A4A]"
              }`}
            >
              AI Config
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-[#4A4A4A] shadow-sm"
                  : "text-[#7A7A7A] hover:text-[#4A4A4A]"
              }`}
            >
              My Profile
            </button>
            <button
              onClick={() => setActiveTab("background")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === "background"
                  ? "bg-white text-[#4A4A4A] shadow-sm"
                  : "text-[#7A7A7A] hover:text-[#4A4A4A]"
              }`}
            >
              Background
            </button>
          </div>
        </div>

        {/* AI Config Tab */}
        {activeTab === "ai-config" && (
          <div className="space-y-8">
            {/* Personality Cards */}
            <div>
              <h2 className="text-lg font-bold text-[#4A4A4A] mb-4">
                AI Personality
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {personalities.map((p) => {
                  const Icon = p.icon;
                  const isSelected = personality === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handlePersonalityChange(p.id)}
                      className={`p-6 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                        isSelected
                          ? "border-[#4A4A4A] bg-white shadow-md"
                          : "border-[#F0F0F0] bg-white hover:border-[#E0E0E0]"
                      }`}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                        style={{ backgroundColor: p.color }}
                      >
                        <Icon size={24} className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-[#4A4A4A] mb-1">
                        {p.name}
                      </h3>
                      <p className="text-sm text-[#7A7A7A]">{p.description}</p>
                      {isSelected && (
                        <div className="mt-3 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-[#B4F8C8]" />
                          <span className="text-xs text-[#7A7A7A]">Active</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Behavioral Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Validation Depth */}
              <div className="bg-white rounded-2xl p-6 border border-[#F0F0F0]">
                <h3 className="text-sm font-bold text-[#4A4A4A] mb-4">
                  Validation Depth
                </h3>
                <div className="flex gap-2 bg-[#F5F5F5] p-1 rounded-xl">
                  <button
                    onClick={() => handleValidationDepthChange("concise")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      validationDepth === "concise"
                        ? "bg-white text-[#4A4A4A] shadow-sm"
                        : "text-[#7A7A7A] hover:text-[#4A4A4A]"
                    }`}
                  >
                    Concise Hug
                  </button>
                  <button
                    onClick={() => handleValidationDepthChange("deep")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      validationDepth === "deep"
                        ? "bg-white text-[#4A4A4A] shadow-sm"
                        : "text-[#7A7A7A] hover:text-[#4A4A4A]"
                    }`}
                  >
                    Deep Reflection
                  </button>
                </div>
              </div>

              {/* Action Style */}
              <div className="bg-white rounded-2xl p-6 border border-[#F0F0F0]">
                <h3 className="text-sm font-bold text-[#4A4A4A] mb-4">
                  Action Style
                </h3>
                <div className="flex gap-2 bg-[#F5F5F5] p-1 rounded-xl">
                  <button
                    onClick={() => handleActionStyleChange("gentle")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      actionStyle === "gentle"
                        ? "bg-white text-[#4A4A4A] shadow-sm"
                        : "text-[#7A7A7A] hover:text-[#4A4A4A]"
                    }`}
                  >
                    Gently Nudge
                  </button>
                  <button
                    onClick={() => handleActionStyleChange("direct")}
                    className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                      actionStyle === "direct"
                        ? "bg-white text-[#4A4A4A] shadow-sm"
                        : "text-[#7A7A7A] hover:text-[#4A4A4A]"
                    }`}
                  >
                    Direct Action
                  </button>
                </div>
              </div>
            </div>

            {/* AI Overview Box */}
            <div className="bg-white rounded-2xl p-8 border-2 border-dashed border-[#E0E0E0]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-[#FFF9F5] rounded-2xl flex items-center justify-center">
                  <Image
                    src="/icon.svg"
                    alt="Ramble"
                    width={40}
                    height={40}
                    className="w-10 h-10"
                  />
                </div>
                <div>
                  <p className="text-sm text-[#7A7A7A] mb-1">AI Summary</p>
                  <p className="text-lg text-[#4A4A4A]">
                    I&apos;ll approach our conversations as{" "}
                    <span className="font-bold" style={{ color: colors.accent }}>
                      {getPersonalityText()}
                    </span>
                    , with{" "}
                    <span className="font-bold">
                      {validationDepth === "concise" ? "concise" : "deep"}
                    </span>{" "}
                    validation and{" "}
                    <span className="font-bold">
                      {actionStyle === "gentle" ? "gentle" : "direct"}
                    </span>{" "}
                    guidance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl p-8 border border-[#F0F0F0]">
            <h2 className="text-lg font-bold text-[#4A4A4A] mb-6">
              My Profile
            </h2>

            <div className="flex flex-col md:flex-row gap-8">
              {/* Input Fields */}
              <div className="flex-1 space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-bold text-[#4A4A4A] mb-2"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7EC8E3] focus:border-transparent transition-all"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-bold text-[#4A4A4A] mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={userEmail}
                    className="w-full px-4 py-3 border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7EC8E3] focus:border-transparent transition-all bg-[#F9F9F9]"
                    placeholder="your@email.com"
                    disabled
                  />
                  <p className="text-xs text-[#7A7A7A] mt-2">
                    Email cannot be changed
                  </p>
                </div>

                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="px-6 py-3 bg-[#4A4A4A] text-white font-semibold rounded-xl hover:bg-black transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {profileSaving ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : profileSaveSuccess ? (
                    <>
                      <Check size={18} />
                      Saved!
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

              {/* Avatar Section */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-bold text-[#4A4A4A] mb-4">Avatar</p>
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-[#7EC8E3] flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {userInitial}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full border-2 border-[#F0F0F0] flex items-center justify-center hover:bg-[#F5F5F5] transition-colors cursor-pointer shadow-sm">
                    <Camera size={18} className="text-[#7A7A7A]" />
                  </button>
                </div>
                <p className="text-xs text-[#7A7A7A] mt-3">
                  Click to upload photo
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Background Tab */}
        {activeTab === "background" && (
          <div className="bg-white rounded-2xl p-8 border border-[#F0F0F0]">
            <h2 className="text-lg font-bold text-[#4A4A4A] mb-2">
              Background Mood
            </h2>
            <p className="text-sm text-[#7A7A7A] mb-6">
              Choose a theme that matches your vibe
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {themes.map((theme) => {
                const isSelected = selectedTheme === theme.id;
                const themeColor = themeColors[theme.id];
                return (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    className={`aspect-square rounded-2xl border-2 p-4 transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "border-[#4A4A4A] shadow-lg"
                        : "border-[#F0F0F0] hover:border-[#E0E0E0]"
                    }`}
                    style={{ backgroundColor: themeColor.bg }}
                  >
                    {/* Preview elements */}
                    <div className="space-y-2">
                      <div
                        className="h-3 w-3/4 rounded-full"
                        style={{ backgroundColor: themeColor.accent }}
                      />
                      <div className="h-2 w-1/2 rounded-full bg-[#E0E0E0]" />
                      <div className="h-2 w-2/3 rounded-full bg-[#E0E0E0]" />
                    </div>

                    {/* Theme name */}
                    <p className="absolute bottom-4 left-4 text-sm font-medium text-[#4A4A4A]">
                      {theme.name}
                    </p>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-[#4A4A4A] rounded-full flex items-center justify-center">
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6L5 9L10 3"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 p-4 bg-[#F9F9F9] rounded-xl">
              <p className="text-sm text-[#7A7A7A]">
                <span className="font-medium text-[#4A4A4A]">Preview:</span>{" "}
                Your dashboard will use the{" "}
                <span className="font-bold">
                  {themes.find((t) => t.id === selectedTheme)?.name}
                </span>{" "}
                theme
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
