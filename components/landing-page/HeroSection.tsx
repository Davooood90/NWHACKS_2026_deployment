import React from "react";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
    >
      {/* Main content container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#4A4A4A] mb-6 leading-tight">
          don&apos;t keep in your{" "}
          <span className="text-[#7EC8E3] relative inline-block">
            crash outs
            {/* Underline decoration */}
            <svg
              className="absolute -bottom-2 left-0 w-full"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 8C50 2 150 2 198 8"
                stroke="#7EC8E3"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-pulse-soft"
              />
            </svg>
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl md:text-3xl font-medium text-[#7A7A7A] mb-12">
          are you ready to{" "}
          <span className="text-[#7EC8E3] font-semibold">rambl</span>?
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Get Started - Primary pill button */}
          <button className="px-10 py-4 bg-[#7EC8E3] text-white font-bold text-lg rounded-[50px] shadow-pastel-blue hover:bg-[#5BA3C0] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            Get Started
          </button>

          {/* Learn More - Ghost pill button */}
          <button className="px-10 py-4 bg-transparent border-3 border-[#7EC8E3] text-[#7EC8E3] font-bold text-lg rounded-[50px] hover:bg-[#7EC8E3]/10 hover:-translate-y-1 transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
