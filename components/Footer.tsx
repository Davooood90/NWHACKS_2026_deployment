const Footer = () => {
  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Motivation", href: "#motivation" },
    { name: "Features", href: "#features" },
    { name: "Team", href: "#team" },
    { name: "FAQ", href: "#faq" },
  ];

  return (
    <footer className="bg-[#F5F5F5] border-t border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {/* Logo and Tagline */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-[#4A4A4A]">rambl</span>
              {/* Mini mascot */}
              <div className="w-10 h-10 bg-[#7EC8E3] rounded-blob animate-blob-wobble flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-2 bg-white rounded-full" />
                  <div className="w-1.5 h-2 bg-white rounded-full" />
                </div>
              </div>
            </div>
            <p className="text-[#7A7A7A] leading-relaxed max-w-xs">
              A safe space for your thoughts. Ramble freely, without judgment.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-lg font-bold text-[#4A4A4A] mb-4">Navigate</h3>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 md:flex-col md:gap-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[#7A7A7A] hover:text-[#7EC8E3] transition-colors font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#E5E5E5] mt-10 pt-6">
          {/* Bottom Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
            <div className="text-[#7A7A7A]">
              © 2026 Rambl. Made for nwHacks.
            </div>
            <div className="flex items-center gap-2 text-[#7A7A7A]">
              <span>Made with</span>
              <svg
                className="w-4 h-4 text-[#FFAEBC]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>and lots of coffee</span>
              <span>☕</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
