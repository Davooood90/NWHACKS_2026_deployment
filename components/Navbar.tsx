"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavLink = {
  name: string;
  href: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("#home");
  const [isScrolled, setIsScrolled] = useState(false);

  const navLinks: NavLink[] = [
    { name: "Home", href: "#home" },
    { name: "Motivation", href: "#motivation" },
    { name: "Features", href: "#features" },
    { name: "Team", href: "#team" },
    { name: "FAQ", href: "#faq" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-40% 0px -40% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveTab(`#${entry.target.id}`);
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions,
    );

    navLinks.forEach((link) => {
      const section = document.querySelector(link.href);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [navLinks]);

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setIsOpen(false);

    const section = document.querySelector(href);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveTab(href);
    }
  };

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-soft"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="#home"
            onClick={(e) =>
              handleLinkClick(
                e as unknown as React.MouseEvent<HTMLAnchorElement>,
                "#home",
              )
            }
            className="flex-shrink-0 flex items-center gap-3 cursor-pointer group"
          >
            {/* Mini Mascot Logo */}
            <div className="w-10 h-10 bg-[#7EC8E3] rounded-blob animate-blob-wobble flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="flex gap-1">
                <div className="w-1.5 h-2 bg-white rounded-full" />
                <div className="w-1.5 h-2 bg-white rounded-full" />
              </div>
            </div>
            <span className="font-bold text-2xl tracking-tight text-[#4A4A4A]">
              rambl
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`px-4 py-2 text-sm font-bold rounded-[50px] transition-all duration-200 cursor-pointer ${
                  activeTab === link.href
                    ? "bg-[#7EC8E3]/20 text-[#7EC8E3]"
                    : "text-[#7A7A7A] hover:text-[#4A4A4A] hover:bg-[#F5F5F5]"
                }`}
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden md:flex items-center">
            <button className="px-6 py-3 bg-[#7EC8E3] text-white font-bold rounded-[50px] shadow-pastel-blue hover:bg-[#5BA3C0] hover:-translate-y-0.5 transition-all duration-200">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#4A4A4A] hover:bg-[#E5E5E5] transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] shadow-soft-lg">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`block px-4 py-4 rounded-[24px] text-base font-bold transition-all ${
                  activeTab === link.href
                    ? "bg-[#7EC8E3]/20 text-[#7EC8E3]"
                    : "text-[#4A4A4A] hover:bg-[#F5F5F5]"
                }`}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4">
              <button className="w-full py-4 bg-[#7EC8E3] text-white font-bold rounded-[50px] shadow-pastel-blue">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
