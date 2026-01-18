"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import UserAvatar from "./UserAvatar";

export default function DashboardNavbar() {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUserAndAvatar = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Load custom avatar from avatar_photos table
        const { data: avatarData } = await supabase
          .from("avatar_photos")
          .select("avatar_url")
          .eq("user_id", user.id)
          .single();

        if (avatarData?.avatar_url) {
          setAvatarUrl(avatarData.avatar_url);
        } else {
          // Fall back to OAuth avatar
          setAvatarUrl(user.user_metadata?.avatar_url || null);
        }
      }
    };
    loadUserAndAvatar();
  }, [supabase.auth, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <nav className="bg-white border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/icon.svg"
            alt="rambl logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold text-[#4A4A4A]">rambl</span>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#7A7A7A] hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer"
            title="Log out"
          >
            <LogOut size={18} />
          </button>
          <Link
            href="/settings"
            className="hover:ring-2 hover:ring-[#7EC8E3] hover:ring-offset-2 transition-all cursor-pointer rounded-full"
            title="Settings"
          >
            <UserAvatar avatarUrl={avatarUrl} size="sm" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
