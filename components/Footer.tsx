"use client";

import { useTheme } from "@/context/ThemeContext";

const Footer = () => {
  const { colors } = useTheme();
  const navLinks = [
    { name: "Home", href: "/#home" },
    { name: "Motivation", href: "/#motivation" },
    { name: "Features", href: "/#features" },
    { name: "Team", href: "/#team" },
    { name: "FAQ", href: "/#faq" },
  ];

  // National (Canada) Resources
  const crisisResources = [
    {
      name: "Talk Suicide Canada",
      description: "Call or text 9-8-8 (National)",
      href: "https://988.ca/",
    },
    {
      name: "Kids Help Phone",
      description: "Text CONNECT to 686868",
      href: "https://kidshelpphone.ca/",
    },
    {
      name: "Wellness Together",
      description: "Mental health support for all Canadians",
      href: "https://www.wellnesstogether.ca/",
    },
  ];

  // Local (BC/Vancouver) Resources
  const localResources = [
    {
      name: "Crisis Centre BC",
      description: "1-800-SUICIDE (1-800-784-2433)",
      href: "https://crisiscentre.bc.ca/",
    },
    {
      name: "Vancouver AAC",
      description: "(VGH) Non-emergency mental health help",
      href: "https://www.vch.ca/en/health-topics/mental-health-substance-use",
    },
    {
      name: "UBC AMS Peer Support",
      description: "Confidential peer support @ UBC",
      href: "https://www.ams.ubc.ca/support-services/student-services/peer-support/",
    },
  ];

  return (
    <footer className="bg-[#F5F5F5] border-t border-[#E5E5E5] relative overflow-hidden">
      {/* Decorative background blob (optional subtle touch) */}
      <div
        className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: `${colors.accent}10` }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {/* Column 1: Brand & Mission */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#4A4A4A] tracking-tight">
                rambl
              </span>
              {/* Mini mascot */}
              <svg
                width="32"
                height="32"
                viewBox="0 0 52 52"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8"
              >
                <rect width="52" height="52" rx="7" fill={colors.accent} />
                <path
                  d="M0 36.7951C5.77778 34.2766 11.5556 34.2766 17.3333 36.7951C23.1111 39.3137 28.8889 39.3137 34.6667 36.7951C40.4444 34.2766 46.2222 34.2766 52 36.7951V46.8692C52 49.3877 49.1111 51.9063 46.2222 51.9063H5.77778C2.88889 51.9063 0 49.3877 0 46.8692V36.7951Z"
                  fill={colors.accentLight}
                />
                <path
                  d="M0 27.9517C5.77778 25.2244 11.5556 25.2244 17.3333 27.9517C23.1111 30.679 28.8889 30.679 34.6667 27.9517C40.4444 25.2244 46.2222 25.2244 52 27.9517V38.8608C46.2222 36.1335 40.4444 36.1335 34.6667 38.8608C28.8889 41.5881 23.1111 41.5881 17.3333 38.8608C11.5556 36.1335 5.77778 36.1335 0 38.8608V27.9517Z"
                  fill={`${colors.accentLight}80`}
                />
                <ellipse
                  cx="12.3223"
                  cy="12.849"
                  rx="3.32228"
                  ry="3.84899"
                  fill={colors.accentDark}
                />
                <ellipse
                  cx="39.3223"
                  cy="12.849"
                  rx="3.32228"
                  ry="3.84899"
                  fill={colors.accentDark}
                />
                <path
                  d="M19 22C19 22 25.5 29.5 33 22"
                  stroke={colors.accentDark}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <p className="text-[#7A7A7A] leading-relaxed text-sm">
              A safe space for your thoughts. Ramble freely, without judgment.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">
              Navigate
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[#7A7A7A] transition-colors font-medium text-sm flex items-center gap-2 group"
                    style={{ "--hover-color": colors.accent } as React.CSSProperties}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = colors.accent;
                      const dot = e.currentTarget.querySelector("span");
                      if (dot) (dot as HTMLElement).style.backgroundColor = colors.accent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#7A7A7A";
                      const dot = e.currentTarget.querySelector("span");
                      if (dot) (dot as HTMLElement).style.backgroundColor = "#E5E5E5";
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E5E5E5] transition-colors" />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: National Crisis Support */}
          <div>
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4 flex items-center gap-2">
              Canada Support
            </h3>
            <ul className="space-y-4">
              {crisisResources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <span
                      className="text-[#4A4A4A] font-semibold text-sm transition-colors flex items-center gap-1"
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4A4A")}
                    >
                      {resource.name}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        ↗
                      </span>
                    </span>
                    <span className="block text-xs text-[#7A7A7A] mt-0.5">
                      {resource.description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Local Vancouver Support */}
          <div>
            <h3 className="text-sm font-bold text-[#4A4A4A] uppercase tracking-wider mb-4">
              Vancouver / BC
            </h3>
            <ul className="space-y-4">
              {localResources.map((resource) => (
                <li key={resource.name}>
                  <a
                    href={resource.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <span
                      className="text-[#4A4A4A] font-semibold text-sm transition-colors flex items-center gap-1"
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4A4A")}
                    >
                      {resource.name}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                        ↗
                      </span>
                    </span>
                    <span className="block text-xs text-[#7A7A7A] mt-0.5">
                      {resource.description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer Card */}
        <div
          className="mt-10 sm:mt-12 p-4 bg-white/50 backdrop-blur-sm rounded-[16px] shadow-sm"
          style={{ border: `1px solid ${colors.accent}30` }}
        >
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-[#5A5A5A]">
              <span className="font-bold text-[#4A4A4A]">Important:</span> Rambl
              is not a substitute for professional mental health care. If you or
              someone you know is in immediate danger, please call{" "}
              <span className="font-bold text-[#4A4A4A]">9-1-1</span> or visit
              your nearest emergency room.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#E5E5E5] mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#9A9A9A] w-full">
            {/* Left Side Element */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span>Made with</span>
              <svg
                className="w-3 h-3"
                fill={colors.accentLight}
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>and good vibes ✨</span>
            </div>

            {/* Right Side Element */}
            <div className="text-center sm:text-right">
              © 2026 Rambl. Crafted for{" "}
              <span className="font-medium" style={{ color: colors.accent }}>
                nwHacks
              </span>
              .
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
