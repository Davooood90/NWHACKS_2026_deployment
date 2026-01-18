import React from "react";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4"
    >
      {/* Background decorative blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-[#FFAEBC] opacity-20 rounded-blob animate-blob-wobble" />
        <div className="absolute top-40 -right-10 w-48 h-48 bg-[#B4F8C8] opacity-20 rounded-blob animate-blob-wobble animation-delay-2000" />
        <div className="absolute bottom-40 left-10 w-32 h-32 bg-[#E0BBE4] opacity-20 rounded-blob animate-blob-wobble animation-delay-1000" />
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-[#FBE7C6] opacity-20 rounded-blob animate-blob-wobble animation-delay-3000" />
      </div>

      {/* Floating decorative dots
      <div className="absolute top-1/4 left-[10%] w-4 h-4 bg-[#A0E7E5] rounded-full opacity-60 animate-float" />
      <div className="absolute top-1/3 right-[15%] w-3 h-3 bg-[#FFAEBC] rounded-full opacity-50 animate-float-gentle animation-delay-1000" />
      <div className="absolute bottom-1/3 left-[20%] w-5 h-5 bg-[#FBE7C6] rounded-full opacity-60 animate-float animation-delay-2000" />
      <div className="absolute top-1/2 right-[10%] w-4 h-4 bg-[#B4F8C8] rounded-full opacity-50 animate-float-slow animation-delay-3000" /> */}

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
        <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
          {/* Get Started - Primary pill button */}
          <button className="w-full sm:w-auto px-10 py-4 bg-[#7EC8E3] text-white font-bold text-lg rounded-[50px] shadow-pastel-blue hover:bg-[#5BA3C0] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
            Get Started
          </button>

          {/* Learn More - Ghost pill button */}
          <button className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-[#7EC8E3] text-[#7EC8E3] font-bold text-lg rounded-[50px] hover:bg-[#7EC8E3]/10 hover:-translate-y-1 transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>

      {/* Floating Mascot - Blue Blob Character */}
      <div className="absolute bottom-8 sm:bottom-16 left-1/2 -translate-x-1/2 z-0 pointer-events-none">
        <div className="relative animate-float-slow">
          {/* Main blob body */}
          <div className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 bg-[#7EC8E3] opacity-20 rounded-blob animate-blob-wobble relative"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
