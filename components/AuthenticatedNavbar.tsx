"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

const AuthenticatedNavbar = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error logging out with supabase:", error);
      }
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return "?";
    return user.email.charAt(0).toUpperCase();
  };

  // Get avatar URL from user metadata
  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || null;
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-soft"
          : "bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex-shrink-0 flex items-center gap-3 cursor-pointer group"
          >
            <Image
              src="/icon.svg"
              alt="rambl logo"
              width={28}
              height={28}
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-xl tracking-tight text-[#4A4A4A]">
              rambl
            </span>
          </Link>

          {/* Right Side - Logout & Avatar */}
          <div className="flex items-center gap-3">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:bg-red-50 hover:text-red-500 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              title="Log out"
            >
              <LogOut size={18} />
            </button>

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#7EC8E3] flex items-center justify-center overflow-hidden">
              {getAvatarUrl() ? (
                <Image
                  src={getAvatarUrl()!}
                  alt="User avatar"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {getUserInitials()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AuthenticatedNavbar;
