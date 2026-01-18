"use client";

import React from "react";

const MotivationSection = () => {
  const factCards = [
    {
      stat: "1 in 5",
      title: "young adults",
      description:
        "experience a mental health condition each year, yet many don't have a safe space to express their feelings.",
      source: "NAMI",
      // Main NAMI statistics page verifying the 1 in 5 figure
      link: "https://www.nami.org/about-mental-illness/mental-health-by-the-numbers/",
    },
    {
      stat: "75%",
      title: "of mental illness",
      description:
        "begins by age 24. Early expression and support can make a significant difference in outcomes.",
      source: "WHO",
      // WHO Adolescent Mental Health fact sheet
      link: "https://www.who.int/news-room/fact-sheets/detail/adolescent-mental-health",
    },
    {
      stat: "60%",
      title: "of youth",
      description:
        "with depression don't receive any treatment. Sometimes, just talking about it can be the first step.",
      source: "MHA",
      // Mental Health America: The State of Mental Health in America Report
      link: "https://mhanational.org/issues/state-mental-health-america",
    },
  ];

  return (
    <section id="motivation" className="scroll-mt-24 py-24 bg-[#FFF9F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Half - Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Left Column - Text */}
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A4A4A] mb-6 leading-tight">
              motivations
            </h2>
            <p className="text-lg md:text-xl text-[#7A7A7A] mb-6 leading-relaxed">
              We believe everyone deserves a space to let their thoughts flow
              freely, without judgment. Sometimes the weight of unexpressed
              emotions can feel overwhelming, but it doesn&apos;t have to be
              that way.
            </p>
            <p className="text-lg md:text-xl text-[#7A7A7A] mb-8 leading-relaxed">
              Rambl was built with one simple goal: give you a friendly
              companion to ramble to, whenever you need it.
            </p>
          </div>

          {/* Right Column - Sad/Thinking Mascot */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative animate-float-gentle">
              {/* Mascot - Thinking blob */}
              <div className="w-64 h-64 md:w-80 md:h-80 bg-[#A0E7E5] rounded-blob animate-blob-wobble opacity-90 relative"></div>
            </div>
          </div>
        </div>

        {/* Bottom Half - Three Fact Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {factCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white p-6 md:p-8 rounded-[24px] shadow-soft hover:shadow-soft-lg hover:-translate-y-2 transition-all duration-300 group"
            >
              {/* Stat */}
              <div className="text-5xl md:text-6xl font-bold text-[#7EC8E3] mb-2">
                {card.stat}
              </div>

              {/* Title */}
              <div className="text-xl font-bold text-[#4A4A4A] mb-4">
                {card.title}
              </div>

              {/* Description */}
              <p className="text-[#7A7A7A] leading-relaxed mb-6">
                {card.description}
              </p>

              {/* Source link */}
              <a
                href={card.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[#FFAEBC] hover:text-[#ff8fa3] transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                Source: {card.source}
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MotivationSection;
