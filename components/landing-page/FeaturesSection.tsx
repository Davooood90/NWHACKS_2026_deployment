"use client";

import React, { useState, useEffect } from "react";

const FeaturesSection = () => {
  const [activeSlide, setActiveSlide] = useState(0);

  // SVG Icons for Features
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
      ),
      title: "Voice Your Thoughts",
      description:
        "Speak freely into the void. Our AI companion listens without judgment, helping you process your emotions through conversation.",
      color: "#7EC8E3",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18ZM7 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0ZM15 10a1 1 0 1 0 2 0 1 1 0 1 0-2 0ZM8 15h8" />
        </svg>
      ),
      title: "Express Yourself",
      description:
        "Sometimes words aren't enough. Use our mood tracking and expressive tools to capture how you're really feeling.",
      color: "#FFAEBC",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      ),
      title: "Grow Together",
      description:
        "Track your emotional journey over time. Watch patterns emerge and celebrate small victories along the way.",
      color: "#B4F8C8",
    },
  ];

  // SVG Icons for Chat Status/Mood
  const screens = [
    {
      title: "Hey, how are you feeling today?",
      content:
        "I'm here to listen. Just start talking whenever you're ready...",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
    },
    {
      title: "I hear you...",
      content:
        "That sounds really tough. It's okay to feel overwhelmed sometimes.",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      ),
    },
    {
      title: "Let's take a breath",
      content:
        "You're doing great by opening up. Want to continue, or take a moment?",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" x2="9.01" y1="9" y2="9" />
          <line x1="15" x2="15.01" y1="9" y2="9" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % screens.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [screens.length]);

  return (
    <section id="features" className="scroll-mt-24 py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A4A4A] mb-4">
            how it works
          </h2>
          <p className="text-lg md:text-xl text-[#7A7A7A] max-w-2xl mx-auto">
            A gentle companion that&apos;s always there when you need to ramble
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - App Mockup */}
          <div className="order-2 lg:order-1">
            <div className="relative">
              <div className="bg-[#F5F5F5] rounded-[40px] p-4 shadow-xl max-w-sm mx-auto">
                <div className="bg-white rounded-[32px] overflow-hidden">
                  <div className="bg-[#7EC8E3] px-6 py-4 flex items-center justify-between">
                    <span className="text-white font-semibold text-lg">
                      rambl
                    </span>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-white/50 rounded-full" />
                      <div className="w-2 h-2 bg-white/50 rounded-full" />
                    </div>
                  </div>

                  <div className="p-6 min-h-[350px] flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        {/* Dynamic SVG Mood Icon */}
                        <div className="w-10 h-10 bg-[#7EC8E3] rounded-full flex items-center justify-center flex-shrink-0 animate-bounce-slow">
                          {screens[activeSlide].icon}
                        </div>
                        <div className="bg-[#F5F5F5] rounded-[20px] rounded-tl-sm p-4 max-w-[85%]">
                          <p className="font-semibold text-[#4A4A4A] mb-1">
                            {screens[activeSlide].title}
                          </p>
                          <p className="text-[#7A7A7A] text-sm">
                            {screens[activeSlide].content}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center gap-3 bg-[#F5F5F5] rounded-[50px] p-3 pr-4">
                        <div className="flex-1 text-[#7A7A7A] text-sm pl-2">
                          Type or tap to speak...
                        </div>
                        <button className="w-10 h-10 bg-[#7EC8E3] rounded-full flex items-center justify-center hover:bg-[#5BA3C0] transition-colors">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                            <line x1="12" y1="19" x2="12" y2="23" />
                            <line x1="8" y1="23" x2="16" y2="23" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {screens.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeSlide === idx
                        ? "bg-[#7EC8E3] w-8"
                        : "bg-[#E5E5E5] w-2"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Feature List */}
          <div className="order-1 lg:order-2">
            <div className="relative">
              <div className="flex flex-col">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    // Added z-0 here to create a base stacking context for the item group
                    className={`relative z-0 flex gap-4 sm:gap-6 items-start group ${
                      idx !== features.length - 1 ? "pb-10 sm:pb-12" : ""
                    }`}
                  >
                    {/* The Line */}
                    {idx !== features.length - 1 && (
                      <div
                        className="absolute z-[-1] left-6 sm:left-7 top-12 sm:top-14 bottom-0 w-px border-l-2 border-dashed border-[#E5E5E5] -ml-[1px]"
                        aria-hidden="true"
                      />
                    )}

                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300 relative z-10 group-hover:z-20"
                      style={{
                        backgroundColor: `${feature.color}20`,
                        color: feature.color,
                      }}
                    >
                      {/* Render Feature SVG */}
                      <div className="w-6 h-6">{feature.icon}</div>
                    </div>

                    {/* Text Content - Give it z-10 so it also sits above the line if they overlap */}
                    <div className="flex-1 relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold text-[#4A4A4A] mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-[#7A7A7A] leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
