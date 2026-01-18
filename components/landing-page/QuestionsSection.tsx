"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const QuestionsSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "What exactly is Rambl?",
      answer:
        "Rambl is your friendly AI companion for when you need to vent, process emotions, or just talk through your thoughts. It's like having a patient friend who's always there to listen—no judgment, no advice unless you ask.",
    },
    {
      question: "Is my data private and secure?",
      answer:
        "Absolutely! Your conversations are encrypted and never shared with third parties. We believe your thoughts are sacred, and we treat them that way. You can also delete your data anytime.",
    },
    {
      question: "Is Rambl a replacement for therapy?",
      answer:
        "No, and we want to be clear about that. Rambl is a supportive tool for everyday emotional processing, not a substitute for professional mental health care. If you're struggling, we encourage you to seek help from a licensed professional.",
    },
    {
      question: "How does the AI work?",
      answer:
        "We use advanced language models trained to be empathetic and supportive. The AI doesn't store your personal information between sessions—it's designed to be a present, attentive listener in the moment.",
    },
    {
      question: "What if I'm in crisis?",
      answer:
        "If you're experiencing a mental health crisis, please reach out to a crisis helpline immediately. In the US, you can call or text 988 for the Suicide & Crisis Lifeline. Rambl will also provide crisis resources if it detects you may need immediate help.",
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="scroll-mt-24 py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#4A4A4A] mb-4">
            frequently asked questions
          </h2>
          <p className="text-lg md:text-xl text-[#7A7A7A]">
            Got questions? We&apos;ve got answers!
          </p>
        </div>

        {/* 60/40 Split Layout */}
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
          {/* Left Column - Accordion (60%) */}
          <div className="lg:col-span-3 space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`rounded-[24px] transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? "bg-[#7EC8E3]/10 shadow-soft"
                    : "bg-[#F5F5F5] hover:bg-[#EEEEEE]"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 sm:p-6 text-left focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold pr-4 text-[#4A4A4A]">
                    {faq.question}
                  </span>
                  <span
                    className={`flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                        openIndex === index
                          ? "bg-[#7EC8E3] text-white"
                          : "bg-white text-[#7A7A7A]"
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-[#7A7A7A] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Smiling Mascot (40%) */}
          <div className="lg:col-span-2 hidden lg:flex items-center justify-center relative min-h-[400px]">
            <div className="relative">
              {/* Happy Mascot */}
              <div className="animate-float-slow">
                <div className="w-56 h-56 bg-[#FFAEBC] rounded-blob animate-blob-wobble opacity-90 relative"></div>
              </div>

              {/* Speech bubble */}
              <div className="absolute -top-12 -right-4 animate-float animation-delay-1000">
                <div className="absolute bottom-0 left-6 w-3 h-3 bg-white border-r border-b border-[#E5E5E5] rotate-45 -mb-1.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default QuestionsSection;
