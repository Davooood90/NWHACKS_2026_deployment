"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardNavbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  
  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url || "";
  };

  return (
    <nav className="bg-white border-b border-[#F0F0F0] px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/icon.svg"
            alt="Ramble logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-2xl font-bold text-[#4A4A4A]">Ramble</span>
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
            className="w-10 h-10 rounded-full bg-[#7EC8E3] flex items-center justify-center hover:ring-2 hover:ring-[#7EC8E3] hover:ring-offset-2 transition-all cursor-pointer"
            title="Settings"
          >
            {getAvatarUrl() ? (
              <Image
                src={getAvatarUrl()}
                alt="User avatar"
                width={10}
                height={10}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <User size={18} className="text-white" />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
