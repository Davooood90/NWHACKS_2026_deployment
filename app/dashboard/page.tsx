"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulated authentication check
  useEffect(() => {
    const checkAuth = async () => {
      // In a real app, you would check a cookie, JWT, or use a hook from
      // an auth provider like NextAuth, Clerk, or Supabase.
      const userToken = localStorage.getItem("rambl_session");

      if (!userToken) {
        router.push("/login");
      } else {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF9F5]">
        <div className="animate-pulse-soft text-2xl text-[#7A7A7A]">
          Loading your rambles...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[#FFF9F5] flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#F5F5F5] hidden md:flex flex-col p-6">
        <div className="mb-10 px-2">
          <h2 className="text-2xl font-bold text-[#7EC8E3]">Rambl</h2>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full text-left px-4 py-3 rounded-2xl bg-[#7EC8E3] text-white font-medium transition-colors">
            🏠 Dashboard
          </button>
          <button className="w-full text-left px-4 py-3 rounded-2xl text-[#7A7A7A] hover:bg-[#FBE7C6] hover:text-[#4A4A4A] transition-colors">
            📝 My Rambles
          </button>
          <button className="w-full text-left px-4 py-3 rounded-2xl text-[#7A7A7A] hover:bg-[#A0E7E5] hover:text-[#4A4A4A] transition-colors">
            🌟 Favorites
          </button>
        </nav>

        <button
          onClick={() => {
            localStorage.removeItem("rambl_session");
            router.push("/login");
          }}
          className="mt-auto px-4 py-3 text-[#7A7A7A] hover:text-pink-400 transition-colors text-sm"
        >
          Sign Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-[#4A4A4A]">Welcome back!</h1>
            <p className="text-[#7A7A7A]">What's on your mind today?</p>
          </div>
          <div className="w-12 h-12 bg-[#FFAEBC] rounded-full flex items-center justify-center shadow-pastel-pink">
            <span className="text-xl">✨</span>
          </div>
        </header>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <button className="hover-lift p-8 bg-white rounded-3xl shadow-soft border border-[#F5F5F5] text-left group">
            <div className="w-12 h-12 bg-[#A0E7E5] rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce-slow">
              🎤
            </div>
            <h3 className="text-xl font-bold text-[#4A4A4A] mb-2">
              New Ramble
            </h3>
            <p className="text-sm text-[#7A7A7A]">
              Start recording or typing your thoughts.
            </p>
          </button>

          <button className="hover-lift p-8 bg-white rounded-3xl shadow-soft border border-[#F5F5F5] text-left group">
            <div className="w-12 h-12 bg-[#B4F8C8] rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce-slow">
              🧠
            </div>
            <h3 className="text-xl font-bold text-[#4A4A4A] mb-2">Reflect</h3>
            <p className="text-sm text-[#7A7A7A]">
              See AI summaries of your recent sessions.
            </p>
          </button>
        </div>

        {/* Recent Activity List */}
        <section>
          <h2 className="text-xl font-bold text-[#4A4A4A] mb-6">
            Recent Rambles
          </h2>
          <div className="bg-white rounded-3xl shadow-soft border border-[#F5F5F5] divide-y divide-[#F5F5F5]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="p-6 flex items-center justify-between hover:bg-[#FFF9F5] first:rounded-t-3xl last:rounded-b-3xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-[#7EC8E3]"></div>
                  <div>
                    <p className="font-semibold text-[#4A4A4A]">
                      Afternoon Reflection #{item}
                    </p>
                    <p className="text-xs text-[#7A7A7A]">
                      October 2{item}, 2023
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-[#E0BBE4] text-[#4A4A4A] rounded-full">
                  Completed
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
