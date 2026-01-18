"use client";

import { useState } from "react";
import Login from "@/components/Login";
import SignUp from "@/components/SignUp";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left Column - Login/SignUp Component */}
        <div className="w-full">
          {isLogin ? (
            <Login onSwitchToSignUp={() => setIsLogin(false)} />
          ) : (
            <SignUp onSwitchToLogin={() => setIsLogin(true)} />
          )}
          
          {/* Continue as a guest link */}
          <div className="mt-8 text-center">
            <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              Continue as a guest
            </button>
          </div>
        </div>

        {/* Right Column - Mascot Avatar */}
        <div className="hidden md:flex items-center justify-center">
          <div className="w-full max-w-md aspect-square bg-gradient-to-br from-[#FFAEBC] to-pink-300 rounded-3xl shadow-2xl flex items-center justify-center relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            {/* Mascot placeholder - you can replace this with an actual mascot image */}
            <div className="relative z-10 text-center">
              <div className="w-48 h-48 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-xl">
                <span className="text-6xl">🎯</span>
              </div>
              <p className="text-white font-bold text-xl">Welcome to Rambl</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}